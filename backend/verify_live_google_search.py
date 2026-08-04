import asyncio
import os
import math
import httpx
from dotenv import load_dotenv

# Load env variables
load_dotenv()

API_KEY = os.environ.get("GOOGLE_MAPS_API_KEY") or os.environ.get("GOOGLE_PLACES_API_KEY") or ""

FIELD_MASK = (
    "places.id,"
    "places.displayName,"
    "places.formattedAddress,"
    "places.nationalPhoneNumber,"
    "places.internationalPhoneNumber,"
    "places.websiteUri,"
    "places.rating,"
    "places.userRatingCount,"
    "places.businessStatus,"
    "places.googleMapsUri,"
    "places.location,"
    "nextPageToken"
)


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 0.0
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1.0 - a)))
    return R * c


def generate_20km_grid(center_lat: float, center_lng: float) -> list:
    radius_km = 20.0
    grid = [(center_lat, center_lng, 13.0)]  # Center point
    r_step = radius_km * 0.55  # 11.0 km
    lat_deg_km = 111.0
    lng_deg_km = 111.0 * math.cos(math.radians(center_lat))

    for i in range(6):
        angle = math.radians(i * 60)
        d_lat = (r_step * math.cos(angle)) / lat_deg_km
        d_lng = (r_step * math.sin(angle)) / lng_deg_km
        grid.append((center_lat + d_lat, center_lng + d_lng, 13.0))

    return grid


async def run_live_verification():
    print("==================================================================================")
    print("             REAL GOOGLE PLACES PRODUCTION VERIFICATION RUNNER                    ")
    print("==================================================================================")

    masked_key = f"{API_KEY[:6]}...{API_KEY[-4:]}" if len(API_KEY) > 10 else "<MISSING>"
    print(f"API Key Loaded: {masked_key}")

    if not API_KEY:
        print("ERROR: GOOGLE_MAPS_API_KEY not found in environment!")
        return

    async with httpx.AsyncClient(timeout=15.0) as client:
        # 1. Geocode search region
        region = "Chennai, Tamil Nadu, India"
        geo_url = "https://maps.googleapis.com/maps/api/geocode/json"
        geo_res = await client.get(geo_url, params={"address": region, "key": API_KEY})
        geo_json = geo_res.json()

        if geo_res.status_code != 200 or geo_json.get("status") != "OK":
            print(f"Geocoding Error: {geo_res.status_code} - {geo_json.get('error_message')}")
            return

        center_loc = geo_json["results"][0]["geometry"]["location"]
        center_lat, center_lng = float(center_loc["lat"]), float(center_loc["lng"])

        print(f"\n1. Geocoded Center Lat/Lng: ({center_lat:.6f}, {center_lng:.6f})")

        # 2. Grid Points
        grid = generate_20km_grid(center_lat, center_lng)
        print(f"2. Grid Points Generated: {len(grid)} points")

        # 3. Perform Google Places API (New) requests
        url = "https://places.googleapis.com/v1/places:searchText"
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask": FIELD_MASK
        }

        all_raw_places = []
        request_log = []
        pagination_verified = False

        total_api_requests = 0

        for pt_idx, (lat, lng, sub_r) in enumerate(grid, 1):
            page_token = None

            for page in range(1, 3):  # Fetch up to 2 pages per point for 20km
                payload = {
                    "textQuery": "Software Companies",
                    "pageSize": 20,
                    "locationRestriction": {
                        "circle": {
                            "center": {"latitude": lat, "longitude": lng},
                            "radius": sub_r * 1000.0
                        }
                    }
                }
                if page_token:
                    payload["pageToken"] = page_token

                total_api_requests += 1
                res = await client.post(url, headers=headers, json=payload)
                request_log.append({
                    "grid_point": pt_idx,
                    "page": page,
                    "status_code": res.status_code,
                })

                if res.status_code == 200:
                    data = res.json()
                    places = data.get("places", [])
                    all_raw_places.extend(places)
                    next_token = data.get("nextPageToken")

                    if next_token:
                        pagination_verified = True
                        page_token = next_token
                    else:
                        break
                else:
                    print(f"   [HTTP {res.status_code}] Google API Error Response: {res.text[:200]}")
                    break

        print(f"3. Google API Requests Made: {total_api_requests}")
        print("4. HTTP Status of Each Request:")
        for log in request_log:
            print(f"   - Request #{log['grid_point']}.{log['page']}: HTTP {log['status_code']}")

        print(f"5. Raw Places Returned: {len(all_raw_places)}")

        # 6. Deduplicate by Place ID
        seen_ids = set()
        unique_places = []
        duplicates_count = 0

        for p in all_raw_places:
            pid = p.get("id")
            if not pid:
                continue
            if pid in seen_ids:
                duplicates_count += 1
                continue
            seen_ids.add(pid)

            loc = p.get("location", {})
            plat, plng = loc.get("latitude"), loc.get("longitude")
            dist = haversine_distance_km(center_lat, center_lng, plat, plng)

            display_name = p.get("displayName", {}).get("text") or "Not Available"
            phone = p.get("nationalPhoneNumber") or p.get("internationalPhoneNumber") or "Not Available"
            website = p.get("websiteUri") or "Not Available"
            address = p.get("formattedAddress") or "Not Available"

            unique_places.append({
                "place_id": pid,
                "company_name": display_name,
                "address": address,
                "phone": phone,
                "website": website,
                "latitude": plat,
                "longitude": plng,
                "distance_km": round(dist, 2),
                "rating": p.get("rating"),
                "review_count": p.get("userRatingCount", 0)
            })

        print(f"6. Unique Google Place IDs: {len(unique_places)}")
        print(f"7. Duplicates Removed: {duplicates_count}")

        # 8. Haversine Distance Filter (<= 20.0 km)
        in_radius_places = [p for p in unique_places if p["distance_km"] <= 20.0]
        outside_radius_count = len(unique_places) - len(in_radius_places)

        print(f"8. Places Removed by Haversine Distance Filter (> 20.0 km): {outside_radius_count}")

        # Truncate to max_results = 100
        final_leads = in_radius_places[:100]
        print(f"9. Final Leads Returned (Max 100 limit): {len(final_leads)}")

        # Contact Availability Counts
        with_phone = sum(1 for p in final_leads if p["phone"] != "Not Available")
        with_website = sum(1 for p in final_leads if p["website"] != "Not Available")

        print(f"10. Number with Phone: {with_phone}")
        print(f"11. Number with Website: {with_website}")
        print("12. Number with Publicly Discovered Email: (Email enrichment runs on website after Place ID deduplication)")

        print("\n==================================================================================")
        print("                         5 SAMPLE REAL PRODUCTION RESULTS                         ")
        print("==================================================================================")

        for i, lead in enumerate(final_leads[:5], 1):
            print(f"\nSample #{i}: {lead['company_name']}")
            print(f"  - Google Place ID:    {lead['place_id']}")
            print(f"  - Distance from Center: {lead['distance_km']} KM")
            print(f"  - Address:             {lead['address']}")
            print(f"  - Phone Available:     {'YES (' + lead['phone'] + ')' if lead['phone'] != 'Not Available' else 'NO'}")
            print(f"  - Website Available:   {'YES (' + lead['website'] + ')' if lead['website'] != 'Not Available' else 'NO'}")

        print("\n==================================================================================")
        print("                          PAGINATION & BILLING VERIFICATION                      ")
        print("==================================================================================")
        print(f"Pagination Supported in FieldMask & Response: {'YES (nextPageToken returned)' if pagination_verified else 'NO (Single page returned)'}")
        print(f"Total Google Billable Requests Executed: {total_api_requests} requests")


if __name__ == "__main__":
    asyncio.run(run_live_verification())
