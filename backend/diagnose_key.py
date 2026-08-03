import asyncio
import os
import httpx
from dotenv import load_dotenv

load_dotenv(override=True)

API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "").strip()


async def diagnose():
    print(f"=== GOOGLE PLACES API KEY DIAGNOSTIC ===")
    print(f"Key in use: {API_KEY}\n")

    async with httpx.AsyncClient() as client:
        # Test 1: Places API (New) endpoint
        url_new = "https://places.googleapis.com/v1/places:searchText"
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress"
        }
        payload = {"textQuery": "Software Companies in Chennai", "maxResultCount": 5}
        
        print("1. Testing Places API (New v1): POST https://places.googleapis.com/v1/places:searchText")
        try:
            res_new = await client.post(url_new, headers=headers, json=payload, timeout=10.0)
            print(f"   HTTP Status: {res_new.status_code}")
            print(f"   Response Body: {res_new.text}\n")
        except Exception as e:
            print(f"   Error: {e}\n")

        # Test 2: Places API (Legacy) endpoint
        url_legacy = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        params = {"query": "Software Companies in Chennai", "key": API_KEY}
        
        print("2. Testing Places API (Legacy): GET https://maps.googleapis.com/maps/api/place/textsearch/json")
        try:
            res_leg = await client.get(url_legacy, params=params, timeout=10.0)
            print(f"   HTTP Status: {res_leg.status_code}")
            print(f"   Response Body: {res_leg.text}\n")
        except Exception as e:
            print(f"   Error: {e}\n")

if __name__ == "__main__":
    asyncio.run(diagnose())
