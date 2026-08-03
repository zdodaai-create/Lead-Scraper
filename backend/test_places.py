import asyncio
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")

async def test_live_google_places():
    print(f"Testing Live Google Places API with key: {API_KEY[:10]}...")
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": "Software Companies in Chennai",
        "key": API_KEY,
    }
    async with httpx.AsyncClient() as client:
        res = await client.get(url, params=params)
        print(f"Status Code: {res.status_code}")
        data = res.json()
        print(f"API Response Status: {data.get('status')}")
        results = data.get("results", [])
        print(f"Returned Results Count: {len(results)}")
        for idx, item in enumerate(results[:5], 1):
            print(f"{idx}. {item.get('name')} | Place ID: {item.get('place_id')} | Rating: {item.get('rating')}")

if __name__ == "__main__":
    asyncio.run(test_live_google_places())
