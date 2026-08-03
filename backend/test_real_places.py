import asyncio
import os
import httpx
from dotenv import load_dotenv
from app.services.places_service import search_business_leads, get_api_key, mask_key

load_dotenv(override=True)


async def test_real_search():
    print("=" * 60)
    print("      REAL GOOGLE PLACES API DIAGNOSTIC & DISCOVERY TEST")
    print("=" * 60)

    api_key = get_api_key()
    print(f"Loaded API Key: {mask_key(api_key)}")

    # 1. Direct HTTP call to POST https://places.googleapis.com/v1/places:searchText
    url = "https://places.googleapis.com/v1/places:searchText"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": (
            "places.id,places.displayName,places.formattedAddress,"
            "places.nationalPhoneNumber,places.websiteUri,places.rating,"
            "places.userRatingCount,places.googleMapsUri"
        )
    }
    payload = {
        "textQuery": "Software Companies in Chennai",
        "maxResultCount": 5
    }

    print("\n--> Step 1: Sending raw POST to https://places.googleapis.com/v1/places:searchText...")
    async with httpx.AsyncClient() as client:
        res = await client.post(url, headers=headers, json=payload, timeout=12.0)
        print(f"--> Google Places API HTTP Status Code: {res.status_code}")
        print(f"--> Google Response Body:\n{res.text}\n")

    # 2. Call service layer
    print("--> Step 2: Triggering search_business_leads('Chennai', 'Software Companies', 20.0, 5)...")
    try:
        leads = await search_business_leads("Chennai", "Software Companies", 20.0, 5)
        print(f"--> Successfully returned {len(leads)} live leads from Google Places API!\n")
        
        for idx, lead in enumerate(leads, 1):
            print(f"[{idx}] {lead.get('company_name')}")
            print(f"    - Google Place ID:  {lead.get('provider_place_id')}")
            print(f"    - Phone:            {lead.get('phone')}")
            print(f"    - Website:          {lead.get('website')}")
            print(f"    - Rating:           {lead.get('rating')} ({lead.get('review_count')} reviews)")
            print(f"    - Address:          {lead.get('address')}")
            print(f"    - Google Maps URL:  {lead.get('google_maps_url')}")
            print(f"    - Source:           {lead.get('source')} (is_demo={lead.get('is_demo')})")
            print("-" * 60)

    except Exception as e:
        print(f"❌ Exception caught in search_business_leads: {e}")

if __name__ == "__main__":
    asyncio.run(test_real_search())
