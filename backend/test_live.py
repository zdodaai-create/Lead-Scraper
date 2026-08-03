import asyncio
import os
import json
from dotenv import load_dotenv
from app.services.places_service import search_business_leads

load_dotenv(override=True)


async def main():
    out = []
    out.append("=== TESTING LIVE DISCOVERY ===")
    api_key = os.getenv("GOOGLE_PLACES_API_KEY")
    out.append(f"Key: {api_key}")
    
    try:
        leads = await search_business_leads("Chennai", "Software Companies", 20.0, 10)
        out.append(f"Returned Leads Count: {len(leads)}")
        for i, lead in enumerate(leads[:5], 1):
            out.append(f"[{i}] {lead.get('company_name')} | Place ID: {lead.get('provider_place_id')} | Phone: {lead.get('phone')} | Website: {lead.get('website')}")
    except Exception as e:
        out.append(f"Error occurred: {e}")

    with open("test_out.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(out))


if __name__ == "__main__":
    asyncio.run(main())
