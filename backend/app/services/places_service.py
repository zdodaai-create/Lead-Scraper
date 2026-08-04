import os
import math
import asyncio
import httpx
import logging
from typing import List, Dict, Any, Tuple, Optional
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# FieldMask for Places API (New v1)
PLACES_NEW_FIELD_MASK = (
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

# API Cost & Safety Safeguards
MAX_GRID_POINTS = 60
MAX_API_REQUESTS_PER_SEARCH = 150
MAX_PAGES_PER_POINT = 3  # Up to 3 pages (60 places) per grid point
CONCURRENT_GRID_REQUESTS = 5


def get_api_key() -> str:
    key = os.environ.get("GOOGLE_MAPS_API_KEY") or os.environ.get("GOOGLE_PLACES_API_KEY")
    if not key:
        load_dotenv()
        key = os.getenv("GOOGLE_MAPS_API_KEY") or os.getenv("GOOGLE_PLACES_API_KEY") or ""
    return key.strip()


def mask_key(key: str) -> str:
    if not key or len(key) < 8:
        return "<NOT_CONFIGURED>"
    return f"{key[:6]}...{key[-4:]}"


def log_places_configuration_status():
    key = get_api_key()
    configured = bool(key)
    logger.info("=== LEAD FINDER API CONFIGURATION STATUS ===")
    logger.info(f"Google Places key configured: {'YES' if configured else 'NO'}")
    logger.info("Demo mode: FALSE (Strict Live Production Mode)")


log_places_configuration_status()


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates exact Haversine distance in kilometers between two lat/lng coordinates."""
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 0.0
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1.0 - a)))
    return R * c


async def geocode_location(client: httpx.AsyncClient, region: str) -> Tuple[Optional[float], Optional[float]]:
    """
    Geocodes region location string to (lat, lng).
    Uses Places Text Search API first for 100% key permission compatibility.
    """
    api_key = get_api_key()
    if not api_key:
        return None, None

    # 1. Places Text Search API (Authorized on all Places API keys)
    text_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {"query": region, "key": api_key}
    try:
        res = await client.get(text_url, params=params, timeout=10.0)
        if res.status_code == 200:
            data = res.json()
            if data.get("status") in ("OK", "ZERO_RESULTS") and data.get("results"):
                loc = data["results"][0].get("geometry", {}).get("location", {})
                if "lat" in loc and "lng" in loc:
                    lat, lng = float(loc["lat"]), float(loc["lng"])
                    logger.info(f"Geocoded '{region}' via Places TextSearch -> ({lat:.4f}, {lng:.4f})")
                    return lat, lng
    except Exception as e:
        logger.warning(f"Places TextSearch Geocoding failed for '{region}': {e}")

    # 2. Secondary Fallback: Geocoding API
    geo_url = "https://maps.googleapis.com/maps/api/geocode/json"
    try:
        res = await client.get(geo_url, params=params, timeout=10.0)
        if res.status_code == 200:
            data = res.json()
            if data.get("status") == "OK" and data.get("results"):
                loc = data["results"][0]["geometry"]["location"]
                lat, lng = float(loc["lat"]), float(loc["lng"])
                logger.info(f"Geocoded '{region}' via Geocoding API -> ({lat:.4f}, {lng:.4f})")
                return lat, lng
    except Exception as e:
        logger.warning(f"Geocoding API call failed for '{region}': {e}")

    return None, None


def generate_search_grid(center_lat: float, center_lng: float, radius_km: float) -> List[Tuple[float, float, float]]:
    """
    Generates geographic search points (lat, lng, sub_radius_km) covering requested search circle.
    """
    if radius_km <= 10.0:
        return [(center_lat, center_lng, radius_km)]

    grid = [(center_lat, center_lng, min(radius_km, 15.0))]  # Always include center point

    lat_degree_km = 111.0
    lng_degree_km = max(0.01, 111.0 * math.cos(math.radians(center_lat)))

    if radius_km <= 20.0:
        # ~7 points: center + 6 points at 0.55 * radius
        r_step = radius_km * 0.55
        sub_r = min(radius_km * 0.65, 20.0)
        for i in range(6):
            angle = math.radians(i * 60)
            d_lat = (r_step * math.cos(angle)) / lat_degree_km
            d_lng = (r_step * math.sin(angle)) / lng_degree_km
            grid.append((center_lat + d_lat, center_lng + d_lng, sub_r))

    elif radius_km <= 50.0:
        # ~19 points: center + 2 concentric rings
        sub_r = 18.0
        # Ring 1
        r1 = radius_km * 0.40
        for i in range(6):
            angle = math.radians(i * 60)
            d_lat = (r1 * math.cos(angle)) / lat_degree_km
            d_lng = (r1 * math.sin(angle)) / lng_degree_km
            grid.append((center_lat + d_lat, center_lng + d_lng, sub_r))
        # Ring 2
        r2 = radius_km * 0.75
        for i in range(12):
            angle = math.radians(i * 30)
            d_lat = (r2 * math.cos(angle)) / lat_degree_km
            d_lng = (r2 * math.sin(angle)) / lng_degree_km
            grid.append((center_lat + d_lat, center_lng + d_lng, sub_r))

    elif radius_km <= 100.0:
        # ~37 points: center + 3 concentric rings
        sub_r = 25.0
        # Ring 1
        r1 = radius_km * 0.30
        for i in range(6):
            angle = math.radians(i * 60)
            d_lat = (r1 * math.cos(angle)) / lat_degree_km
            d_lng = (r1 * math.sin(angle)) / lng_degree_km
            grid.append((center_lat + d_lat, center_lng + d_lng, sub_r))
        # Ring 2
        r2 = radius_km * 0.60
        for i in range(12):
            angle = math.radians(i * 30)
            d_lat = (r2 * math.cos(angle)) / lat_degree_km
            d_lng = (r2 * math.sin(angle)) / lng_degree_km
            grid.append((center_lat + d_lat, center_lng + d_lng, sub_r))
        # Ring 3
        r3 = radius_km * 0.85
        for i in range(18):
            angle = math.radians(i * 20)
            d_lat = (r3 * math.cos(angle)) / lat_degree_km
            d_lng = (r3 * math.sin(angle)) / lng_degree_km
            grid.append((center_lat + d_lat, center_lng + d_lng, sub_r))

    else:
        # 100-300 KM: Bounded grid (~49-60 points)
        step_km = 35.0
        sub_r = 40.0
        steps = int(math.ceil(radius_km / step_km))
        for dx in range(-steps, steps + 1):
            for dy in range(-steps, steps + 1):
                if dx == 0 and dy == 0:
                    continue
                dist_km = math.sqrt((dx * step_km) ** 2 + (dy * step_km) ** 2)
                if dist_km <= radius_km * 0.95:
                    d_lat = (dy * step_km) / lat_degree_km
                    d_lng = (dx * step_km) / lng_degree_km
                    grid.append((center_lat + d_lat, center_lng + d_lng, sub_r))
                if len(grid) >= MAX_GRID_POINTS:
                    break
            if len(grid) >= MAX_GRID_POINTS:
                break

    return grid[:MAX_GRID_POINTS]


async def fetch_place_details(client: httpx.AsyncClient, place_id: str) -> Dict[str, Any]:
    """
    Enriches a single Place ID with official Phone, Website, Address, and Google Maps URL.
    Tries Places API (New) GET https://places.googleapis.com/v1/places/{place_id}
    with fallback to Legacy Place Details.
    """
    api_key = get_api_key()
    if not api_key or not place_id:
        return {}

    # 1. Primary: Places API (New v1) Details
    url_new = f"https://places.googleapis.com/v1/places/{place_id}"
    headers_new = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "id,displayName,formattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,googleMapsUri"
    }

    try:
        res = await client.get(url_new, headers=headers_new, timeout=8.0)
        if res.status_code == 200:
            p = res.json()
            phone = p.get("internationalPhoneNumber") or p.get("nationalPhoneNumber") or "Not Available"
            website = p.get("websiteUri") or "Not Available"
            address = p.get("formattedAddress") or "Not Available"
            maps_url = p.get("googleMapsUri") or f"https://www.google.com/maps/place/?q=place_id:{place_id}"
            return {
                "phone": phone,
                "website": website,
                "address": address,
                "google_maps_url": maps_url
            }
    except Exception as e:
        logger.warning(f"Places API (New) Details failed for {place_id}: {e}")

    # 2. Fallback: Places API (Legacy) Details
    url_leg = "https://maps.googleapis.com/maps/api/place/details/json"
    params_leg = {
        "place_id": place_id,
        "fields": "formatted_phone_number,international_phone_number,website,url,formatted_address",
        "key": api_key
    }
    try:
        res = await client.get(url_leg, params=params_leg, timeout=8.0)
        if res.status_code == 200:
            data = res.json()
            if data.get("status") == "OK" and data.get("result"):
                p = data["result"]
                phone = p.get("international_phone_number") or p.get("formatted_phone_number") or "Not Available"
                website = p.get("website") or "Not Available"
                address = p.get("formatted_address") or "Not Available"
                maps_url = p.get("url") or f"https://www.google.com/maps/place/?q=place_id:{place_id}"
                return {
                    "phone": phone,
                    "website": website,
                    "address": address,
                    "google_maps_url": maps_url
                }
    except Exception as e:
        logger.warning(f"Legacy Place Details failed for {place_id}: {e}")

    return {}


async def fetch_grid_point_places(
    client: httpx.AsyncClient,
    semaphore: asyncio.Semaphore,
    query: str,
    lat: float,
    lng: float,
    sub_radius_km: float,
    stats: Dict[str, int]
) -> List[Dict[str, Any]]:
    """
    Queries Google Places API for a specific grid coordinate with pagination support.
    Supports both Places API (New v1) and Places API (Legacy TextSearch) fallback.
    """
    api_key = get_api_key()
    if not api_key:
        return []

    sub_radius_meters = min(float(sub_radius_km * 1000.0), 50000.0)
    point_results = []

    # 1. Try Primary: Google Places API (New v1)
    new_url = "https://places.googleapis.com/v1/places:searchText"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": PLACES_NEW_FIELD_MASK
    }
    page_token_new = None

    for _ in range(MAX_PAGES_PER_POINT):
        if stats["api_requests"] >= MAX_API_REQUESTS_PER_SEARCH:
            break

        payload = {
            "textQuery": query,
            "pageSize": 20,
            "locationRestriction": {
                "circle": {
                    "center": {"latitude": lat, "longitude": lng},
                    "radius": sub_radius_meters
                }
            }
        }
        if page_token_new:
            payload["pageToken"] = page_token_new

        async with semaphore:
            try:
                stats["api_requests"] += 1
                res = await client.post(new_url, headers=headers, json=payload, timeout=12.0)
                if res.status_code == 200:
                    data = res.json()
                    raw_places = data.get("places", [])
                    stats["raw_places"] += len(raw_places)

                    for p in raw_places:
                        place_id = p.get("id")
                        if not place_id:
                            continue
                        display_name = p.get("displayName", {}).get("text") or "Not Available"
                        phone = p.get("internationalPhoneNumber") or p.get("nationalPhoneNumber") or "Not Available"
                        website = p.get("websiteUri") or "Not Available"
                        address = p.get("formattedAddress") or "Not Available"
                        rating = p.get("rating")
                        review_count = p.get("userRatingCount", 0)
                        location = p.get("location", {})

                        point_results.append({
                            "company_name": display_name,
                            "phone": phone,
                            "website": website,
                            "address": address,
                            "latitude": location.get("latitude"),
                            "longitude": location.get("longitude"),
                            "rating": rating,
                            "review_count": review_count,
                            "business_status": p.get("businessStatus", "OPERATIONAL"),
                            "provider_place_id": place_id,
                            "places_source": True,
                            "is_demo": False,
                            "google_maps_url": p.get("googleMapsUri") or f"https://www.google.com/maps/place/?q=place_id:{place_id}",
                            "source": "Google Places API",
                        })

                    page_token_new = data.get("nextPageToken")
                    if not page_token_new:
                        break
                    await asyncio.sleep(0.2)
                else:
                    break
            except Exception as e:
                logger.warning(f"Places API (New) call exception: {e}")
                break

    if point_results:
        return point_results

    # 2. Secondary: Fallback to Places API (Legacy TextSearch) with pagination & location radius
    legacy_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    legacy_token = None

    for _ in range(MAX_PAGES_PER_POINT):
        if stats["api_requests"] >= MAX_API_REQUESTS_PER_SEARCH:
            break

        if legacy_token:
            params = {"pagetoken": legacy_token, "key": api_key}
            await asyncio.sleep(2.0)  # Delay for Google Legacy pagetoken activation
        else:
            params = {
                "query": query,
                "location": f"{lat},{lng}",
                "radius": int(sub_radius_meters),
                "key": api_key
            }

        async with semaphore:
            try:
                stats["api_requests"] += 1
                res = await client.get(legacy_url, params=params, timeout=12.0)
                if res.status_code == 200:
                    data = res.json()
                    status = data.get("status")
                    if status in ("OK", "ZERO_RESULTS"):
                        raw_results = data.get("results", [])
                        stats["raw_places"] += len(raw_results)

                        for place in raw_results:
                            place_id = place.get("place_id")
                            if not place_id:
                                continue
                            location = place.get("geometry", {}).get("location", {})

                            point_results.append({
                                "company_name": place.get("name") or "Not Available",
                                "phone": "Not Available",
                                "website": "Not Available",
                                "address": place.get("formatted_address") or "Not Available",
                                "latitude": location.get("lat"),
                                "longitude": location.get("lng"),
                                "rating": place.get("rating"),
                                "review_count": place.get("user_ratings_total", 0),
                                "business_status": place.get("business_status", "OPERATIONAL"),
                                "provider_place_id": place_id,
                                "places_source": True,
                                "is_demo": False,
                                "google_maps_url": f"https://www.google.com/maps/place/?q=place_id:{place_id}",
                                "source": "Google Places API",
                            })

                        legacy_token = data.get("next_page_token")
                        if not legacy_token:
                            break
                    else:
                        break
                else:
                    break
            except Exception as e:
                logger.error(f"Legacy Places API error: {e}")
                break

    return point_results


async def search_business_leads(region: str, category: str, radius_km: float, max_results: int) -> List[Dict[str, Any]]:
    """
    Primary business lead discovery engine.
    Applies geographic grid searching, pagination, Place ID deduplication, Haversine radius filtering,
    and Place Details enrichment for contact fields.
    """
    api_key = get_api_key()
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="GOOGLE_MAPS_API_KEY is not configured in environment variables. Please set GOOGLE_MAPS_API_KEY in Render Dashboard."
        )

    logger.info(f"POST /api/search RECEIVED PARAMS: region='{region}', category='{category}', radius_km={radius_km}, max_results={max_results}")

    query = f"{category}"
    stats = {
        "grid_points": 0,
        "api_requests": 0,
        "raw_places": 0,
        "unique_places": 0,
        "duplicates_removed": 0,
        "outside_radius_removed": 0,
        "final_returned": 0
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        # 1. Geocode search region
        center_lat, center_lng = await geocode_location(client, region)
        if center_lat is None or center_lng is None:
            logger.warning(f"Could not geocode '{region}'. Falling back to center text query search.")
            query = f"{category} in {region}"
            grid = [(0.0, 0.0, radius_km)]
            use_coords = False
        else:
            grid = generate_search_grid(center_lat, center_lng, radius_km)
            use_coords = True

        stats["grid_points"] = len(grid)
        semaphore = asyncio.Semaphore(CONCURRENT_GRID_REQUESTS)

        # 2. Execute grid searches across coordinates - Aggregated into master collection
        tasks = []
        for lat, lng, sub_r in grid:
            tasks.append(fetch_grid_point_places(client, semaphore, query, lat, lng, sub_r, stats))

        grid_responses = await asyncio.gather(*tasks, return_exceptions=True)

        all_raw_leads = []
        for resp in grid_responses:
            if isinstance(resp, list):
                all_raw_leads.extend(resp)

        # 3. Deduplicate STRICTLY by Google Place ID
        seen_place_ids = set()
        unique_leads = []
        for item in all_raw_leads:
            pid = item.get("provider_place_id")
            if pid and pid in seen_place_ids:
                stats["duplicates_removed"] += 1
                continue
            if pid:
                seen_place_ids.add(pid)
            unique_leads.append(item)

        stats["unique_places"] = len(unique_leads)

        # 4. Haversine Distance Filter (strictly <= radius_km)
        in_radius_leads = []
        if use_coords:
            for item in unique_leads:
                plat, plng = item.get("latitude"), item.get("longitude")
                if plat is not None and plng is not None:
                    dist = haversine_distance_km(center_lat, center_lng, plat, plng)
                    item["distance_km"] = round(dist, 2)
                    if dist <= radius_km:
                        in_radius_leads.append(item)
                    else:
                        stats["outside_radius_removed"] += 1
                else:
                    in_radius_leads.append(item)
        else:
            in_radius_leads = unique_leads

        # Add region context to items
        for item in in_radius_leads:
            item["category"] = category
            item["city"] = region
            item["country"] = "India"

        # 5. Apply max_results slicing AFTER discovery, grid aggregation, Place ID deduplication, and radius filtering
        final_leads = in_radius_leads[:max_results]
        stats["final_returned"] = len(final_leads)

        # 6. Perform Place Details Enrichment ONLY on final surviving leads missing phone/website
        detail_enrichment_tasks = []
        leads_needing_enrichment = []

        for lead in final_leads:
            need_phone = not lead.get("phone") or lead.get("phone") == "Not Available"
            need_website = not lead.get("website") or lead.get("website") == "Not Available"
            if (need_phone or need_website) and lead.get("provider_place_id"):
                detail_enrichment_tasks.append(fetch_place_details(client, lead["provider_place_id"]))
                leads_needing_enrichment.append(lead)

        if detail_enrichment_tasks:
            logger.info(f"Executing Place Details enrichment for {len(detail_enrichment_tasks)} leads missing contact info...")
            details_results = await asyncio.gather(*detail_enrichment_tasks, return_exceptions=True)
            for idx, res in enumerate(details_results):
                if isinstance(res, dict) and res:
                    target = leads_needing_enrichment[idx]
                    if res.get("phone") and res["phone"] != "Not Available":
                        target["phone"] = res["phone"]
                    if res.get("website") and res["website"] != "Not Available":
                        target["website"] = res["website"]
                    if res.get("address") and res["address"] != "Not Available":
                        target["address"] = res["address"]
                    if res.get("google_maps_url"):
                        target["google_maps_url"] = res["google_maps_url"]

        # Structured Metrics Logging
        logger.info("==================================================")
        logger.info("   LEAD FINDER GEOGRAPHIC SEARCH METRICS REPORT   ")
        logger.info("==================================================")
        logger.info(f"Frontend requested max_results: {max_results}")
        logger.info(f"Backend received radius_km:    {radius_km} KM")
        logger.info(f"Search Region:                {region}")
        logger.info(f"Search Center Lat/Lng:        {center_lat}, {center_lng}")
        logger.info(f"grid_points_generated:        {stats['grid_points']}")
        logger.info(f"api_requests_made:            {stats['api_requests']}")
        logger.info(f"raw_places_count:             {stats['raw_places']}")
        logger.info(f"unique_place_ids_count:       {stats['unique_places']}")
        logger.info(f"duplicates_removed:           {stats['duplicates_removed']}")
        logger.info(f"in_radius_count:              {len(in_radius_leads)}")
        logger.info(f"outside_radius_removed:       {stats['outside_radius_removed']}")
        logger.info(f"final_results_count:          {stats['final_returned']}")
        logger.info("==================================================")

        return final_leads
