import asyncio
import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv(override=True)

API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "").strip()


async def check():
    out = {}
    out["key_length"] = len(API_KEY)
    out["key_prefix"] = API_KEY[:10]

    async with httpx.AsyncClient() as client:
        # Test Places API (New)
        url_new = "https://places.googleapis.com/v1/places:searchText"
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask": "*"
        }
        payload = {"textQuery": "Software Companies in Chennai", "maxResultCount": 5}
        try:
            res1 = await client.post(url_new, headers=headers, json=payload, timeout=10.0)
            out["new_api_status"] = res1.status_code
            try:
                out["new_api_json"] = res1.json()
            except Exception:
                out["new_api_text"] = res1.text
        except Exception as e:
            out["new_api_err"] = str(e)

        # Test Places API (Legacy)
        url_leg = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        params = {"query": "Software Companies in Chennai", "key": API_KEY}
        try:
            res2 = await client.get(url_leg, params=params, timeout=10.0)
            out["legacy_api_status"] = res2.status_code
            try:
                out["legacy_api_json"] = res2.json()
            except Exception:
                out["legacy_api_text"] = res2.text
        except Exception as e:
            out["legacy_api_err"] = str(e)

    with open("key_status.json", "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)


if __name__ == "__main__":
    asyncio.run(check())
