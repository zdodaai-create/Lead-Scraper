import os
import httpx
import logging
from typing import List, Dict, Any, Tuple, Optional
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Valid explicit FieldMask required for POST https://places.googleapis.com/v1/places:searchText
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
    "places.location"
)


def get_api_key() -> str:
    """Loads GOOGLE_PLACES_API_KEY or GOOGLE_MAPS_API_KEY, prioritizing process env vars."""
    key = os.environ.get("GOOGLE_PLACES_API_KEY") or os.environ.get("GOOGLE_MAPS_API_KEY")
    if not key:
        load_dotenv()
        key = os.getenv("GOOGLE_PLACES_API_KEY") or os.getenv("GOOGLE_MAPS_API_KEY") or ""
    return key.strip()


def mask_key(key: str) -> str:
    """Masks API key for safe logging (e.g. AIzaSy...4A). Never prints full key."""
    if not key or len(key) < 8:
        return "<EMPTY_KEY>"
    return f"{key[:6]}...{key[-4:]}"


def is_demo_mode_active() -> bool:
    """Checks if DEMO_MODE is enabled, prioritizing process env vars."""
    if "DEMO_MODE" in os.environ:
        return os.environ["DEMO_MODE"].lower() == "true"
    load_dotenv()
    return os.getenv("DEMO_MODE", "false").lower() == "true"


async def fetch_places_new_api(client: httpx.AsyncClient, query: str, max_results: int) -> Tuple[List[Dict[str, Any]], Optional[int], Optional[str]]:
    """
    Queries official Google Places API (New) endpoint:
    POST https://places.googleapis.com/v1/places:searchText

    Sends X-Goog-Api-Key and X-Goog-FieldMask headers.
    Returns (results_list, http_status_code, error_message_body).
    """
    api_key = get_api_key()
    if not api_key:
        return [], 400, "GOOGLE_PLACES_API_KEY is missing in backend/.env"

    url = "https://places.googleapis.com/v1/places:searchText"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": PLACES_NEW_FIELD_MASK
    }
    payload = {
        "textQuery": query,
        "maxResultCount": min(max_results, 20)
    }

    logger.info(f"Sending POST to Places API (New) with key {mask_key(api_key)} for query: '{query}'")

    try:
        res = await client.post(url, headers=headers, json=payload, timeout=12.0)
        logger.info(f"Google Places API (New) Response Status: {res.status_code}")

        if res.status_code == 200:
            data = res.json()
            places_raw = data.get("places", [])
            results = []
            for p in places_raw:
                place_id = p.get("id")
                if not place_id:
                    continue

                display_name = p.get("displayName", {}).get("text") or "Not Available"
                phone = p.get("nationalPhoneNumber") or p.get("internationalPhoneNumber") or "Not Available"
                website = p.get("websiteUri") or "Not Available"
                address = p.get("formattedAddress") or "Not Available"
                rating = p.get("rating")
                review_count = p.get("userRatingCount", 0)
                location = p.get("location", {})

                results.append({
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
            return results, 200, None
        else:
            try:
                err_json = res.json()
                msg = err_json.get("error", {}).get("message") or res.text
            except Exception:
                msg = res.text
            
            logger.error(f"Google Places API (New) Error Body [HTTP {res.status_code}]: {msg}")
            return [], res.status_code, msg

    except Exception as e:
        logger.error(f"HTTP Exception connecting to Google Places API (New): {e}")
        return [], 500, str(e)


async def fetch_places_legacy_api(client: httpx.AsyncClient, query: str, radius_km: float, max_results: int) -> Tuple[List[Dict[str, Any]], Optional[int], Optional[str]]:
    """
    Fallback query to Google Places Text Search (Legacy API):
    GET https://maps.googleapis.com/maps/api/place/textsearch/json
    """
    api_key = get_api_key()
    if not api_key:
        return [], 400, "GOOGLE_PLACES_API_KEY is missing in backend/.env"

    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": query,
        "key": api_key,
        "radius": int(radius_km * 1000)
    }

    try:
        res = await client.get(url, params=params, timeout=12.0)
        logger.info(f"Google Places API (Legacy) Response Status: {res.status_code}")
        if res.status_code != 200:
            return [], res.status_code, res.text

        data = res.json()
        status = data.get("status")

        if status not in ("OK", "ZERO_RESULTS"):
            err_msg = data.get("error_message") or f"Google Places API Status: {status}"
            logger.error(f"Google Places API (Legacy) Status Error: {err_msg}")
            # Map legacy status strings to HTTP status codes
            code = 403 if status in ("REQUEST_DENIED", "OVER_QUERY_LIMIT") else 400
            return [], code, err_msg

        raw_results = data.get("results", [])[:max_results]
        results = []

        detail_tasks = [fetch_place_details_legacy(client, p["place_id"]) for p in raw_results if p.get("place_id")]
        detail_responses = await asyncio.gather(*detail_tasks, return_exceptions=True)

        for i, place in enumerate(raw_results):
            place_id = place.get("place_id")
            details = detail_responses[i] if (i < len(detail_responses) and isinstance(detail_responses[i], dict)) else {}
            location = place.get("geometry", {}).get("location", {})

            results.append({
                "company_name": place.get("name") or "Not Available",
                "phone": details.get("formatted_phone_number") or details.get("international_phone_number") or "Not Available",
                "website": details.get("website") or "Not Available",
                "address": place.get("formatted_address") or "Not Available",
                "latitude": location.get("lat"),
                "longitude": location.get("lng"),
                "rating": place.get("rating"),
                "review_count": place.get("user_ratings_total", 0),
                "business_status": place.get("business_status", "OPERATIONAL"),
                "provider_place_id": place_id,
                "places_source": True,
                "is_demo": False,
                "google_maps_url": details.get("url") or f"https://www.google.com/maps/place/?q=place_id:{place_id}",
                "source": "Google Places API",
            })

        return results, 200, None

    except Exception as e:
        return [], 500, str(e)


async def fetch_place_details_legacy(client: httpx.AsyncClient, place_id: str) -> Dict[str, Any]:
    api_key = get_api_key()
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "fields": "formatted_phone_number,international_phone_number,website,url",
        "key": api_key
    }
    try:
        res = await client.get(url, params=params)
        if res.status_code == 200:
            return res.json().get("result", {})
    except Exception:
        pass
    return {}


async def search_business_leads(region: str, category: str, radius_km: float, max_results: int) -> List[Dict[str, Any]]:
    """
    Primary discovery engine.
    1. Queries Places API (New) v1 endpoint.
    2. If fails with 404/not activated, attempts Legacy Text Search.
    3. Preserves exact HTTP status code (400, 403, 429, 502) and error detail from Google Places API.
    """
    api_key = get_api_key()
    demo_mode = is_demo_mode_active()

    if not api_key:
        if demo_mode:
            logger.info("Google Places API Key missing; DEMO_MODE is true. Generating demo leads.")
            return generate_demo_leads(region, category, max_results)
        else:
            raise HTTPException(
                status_code=400,
                detail="Google Places API Key is missing. Please set GOOGLE_PLACES_API_KEY in backend/.env to retrieve live business leads."
            )

    query = f"{category} in {region}"
    errors = []
    last_status_code = 400

    async with httpx.AsyncClient(timeout=12.0) as client:
        # 1. Primary: Places API (New)
        results, status_code_new, err_new = await fetch_places_new_api(client, query, max_results)
        if results:
            for item in results:
                item["category"] = category
                item["city"] = region
                item["country"] = "India"
            return results

        if err_new:
            errors.append(f"[Places API New]: {err_new}")
            if status_code_new and status_code_new != 200:
                last_status_code = status_code_new

        # 2. Fallback: Places API (Legacy)
        legacy_results, status_code_leg, err_leg = await fetch_places_legacy_api(client, query, radius_km, max_results)
        if legacy_results:
            for item in legacy_results:
                item["category"] = category
                item["city"] = region
                item["country"] = "India"
            return legacy_results

        if err_leg:
            errors.append(f"[Places API Legacy]: {err_leg}")
            if status_code_leg and status_code_leg != 200:
                last_status_code = status_code_leg

    # Preserve exact Google HTTP error status code (400, 403, 429, 502)
    if errors and not demo_mode:
        combined_error = " | ".join(errors)
        logger.error(f"Google Places API Error (HTTP {last_status_code}): {combined_error}")
        
        # Map status code cleanly
        final_code = last_status_code if last_status_code in (400, 401, 403, 429, 500, 502, 503) else 400
        raise HTTPException(
            status_code=final_code,
            detail=f"Google Places API Error (HTTP {final_code}): {combined_error}"
        )

    if demo_mode:
        logger.info("Zero live results returned. DEMO_MODE is true; generating demo leads.")
        return generate_demo_leads(region, category, max_results)

    return []


def generate_demo_leads(region: str, category: str, max_results: int) -> List[Dict[str, Any]]:
    """
    STRICTLY ISOLATED DEMO MODE ONLY.
    Only executed if DEMO_MODE=true is explicitly set in environment.
    """
    mock_company_prefixes = [
        "Apex", "TechVersal", "Innovate", "Starlight", "CyberCorp", "NextGen",
        "CloudMatrix", "Quantum", "Omega", "Vanguard", "Pinnacle", "Aether"
    ]
    
    mock_company_suffixes = [
        "Technologies", "Solutions", "Labs", "Systems", "Softwares", "Digital"
    ]

    leads = []
    import random
    random.seed(hash(f"{region}_{category}"))

    count = min(max_results, 15)
    for i in range(1, count + 1):
        prefix = random.choice(mock_company_prefixes)
        suffix = random.choice(mock_company_suffixes)
        company_name = f"{prefix} {suffix} (Demo)"
        
        domain_name = f"{prefix.lower()}{suffix.lower()[:4]}.com"
        website = f"https://www.{domain_name}"
        
        phone = f"+91 44 2800{i:04d}"
        role_email = f"info@{domain_name}"
        rating = round(random.uniform(4.0, 4.9), 1)

        lead = {
            "company_name": company_name,
            "category": category,
            "phone": phone,
            "email": role_email,
            "website": website,
            "address": f"Demo Park Suite #{i * 10}, {region}",
            "city": region,
            "state": None,
            "country": "India",
            "postal_code": "600001",
            "latitude": 13.0827,
            "longitude": 80.2707,
            "rating": rating,
            "review_count": i * 25,
            "business_status": "OPERATIONAL",
            "provider_place_id": f"demo_place_id_{i}",
            "places_source": False,
            "is_demo": True,
            "google_maps_url": None,
            "email_source_url": f"{website}/contact",
            "source": "Demo Data",
        }
        leads.append(lead)

    return leads
