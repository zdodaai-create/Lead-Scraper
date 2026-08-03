import asyncio
import os
import httpx
from dotenv import load_dotenv

load_dotenv(override=True)

API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "").strip()

async def run_direct_test():
    log_lines = []
    log_lines.append(f"Testing Google Places API Key: {API_KEY}\n")

    async with httpx.AsyncClient() as client:
        # Test Places API (New)
        url_new = "https://places.googleapis.com/v1/places:searchText"
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress"
        }
        payload = {"textQuery": "Software Companies in Chennai", "maxResultCount": 5}
        
        log_lines.append("=== TEST 1: Places API (New v1) ===")
        try:
            res1 = await client.post(url_new, headers=headers, json=payload, timeout=10.0)
            log_lines.append(f"Status Code: {res1.status_code}")
            log_lines.append(f"Response: {res1.text}\n")
        except Exception as e:
            log_lines.append(f"Error: {e}\n")

        # Test Places API (Legacy)
        url_leg = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        params = {"query": "Software Companies in Chennai", "key": API_KEY}
        
        log_lines.append("=== TEST 2: Places API (Legacy) ===")
        try:
            res2 = await client.get(url_leg, params=params, timeout=10.0)
            log_lines.append(f"Status Code: {res2.status_code}")
            log_lines.append(f"Response: {res2.text}\n")
        except Exception as e:
            log_lines.append(f"Error: {e}\n")

    with open("key_log.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(log_lines))

if __name__ == "__main__":
    asyncio.run(run_direct_test())
