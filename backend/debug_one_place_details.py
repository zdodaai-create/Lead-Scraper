import asyncio
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.environ.get("GOOGLE_MAPS_API_KEY") or os.environ.get("GOOGLE_PLACES_API_KEY") or ""


async def test_single_place_details():
    place_id = "ChIJ51XJ9QhnUjoR0i3D_x5t-1A"  # Aspire Systems, Siruseri, Chennai
    url = f"https://places.googleapis.com/v1/places/{place_id}"

    field_mask = "id,displayName,formattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,googleMapsUri"

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": field_mask
    }

    print("==================================================================================")
    print("        DEBUGGING GOOGLE PLACES API (NEW) PLACE DETAILS FOR ONE PLACE ID          ")
    print("==================================================================================")
    print(f"Place ID: {place_id}")
    print(f"URL:      {url}")
    print(f"Headers:  X-Goog-Api-Key={API_KEY[:6]}...{API_KEY[-4:]}")
    print(f"          X-Goog-FieldMask={field_mask}\n")

    async with httpx.AsyncClient(timeout=10.0) as client:
        res = await client.get(url, headers=headers)
        print(f"HTTP Status Code: {res.status_code}")
        print("Raw Response Text:")
        print(res.text)

        if res.status_code == 200:
            data = res.json()
            print("\nSANITIZED PARSED FIELDS:")
            print(f"  - id:                       {data.get('id')}")
            print(f"  - displayName:              {data.get('displayName', {}).get('text')}")
            print(f"  - formattedAddress:         {data.get('formattedAddress')}")
            print(f"  - nationalPhoneNumber:      {data.get('nationalPhoneNumber')}")
            print(f"  - internationalPhoneNumber: {data.get('internationalPhoneNumber')}")
            print(f"  - websiteUri:               {data.get('websiteUri')}")
            print(f"  - googleMapsUri:            {data.get('googleMapsUri')}")


if __name__ == "__main__":
    asyncio.run(test_single_place_details())
