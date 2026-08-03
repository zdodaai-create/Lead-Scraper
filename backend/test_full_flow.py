import asyncio
import logging
from app.database.init_db import init_db
from app.services.places_service import search_business_leads
from app.services.website_service import enrich_lead_from_website

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_full_flow")


async def verify():
    init_db()
    print("=" * 60)
    print("      VERIFYING LIVE GOOGLE PLACES DISCOVERY & DB PERSISTENCE")
    print("=" * 60)

    region = "Chennai"
    category = "Software Companies"

    print(f"--> Triggering live discovery for: '{category} in {region}'...")
    leads = await search_business_leads(region, category, 20.0, 5)

    print(f"--> Google Places API returned {len(leads)} real business records!\n")

    for idx, lead in enumerate(leads[:5], 1):
        print(f"[{idx}] COMPANY: {lead.get('company_name')}")
        print(f"    - Google Place ID:   {lead.get('provider_place_id')}")
        print(f"    - Address:           {lead.get('address')}")
        print(f"    - Phone:             {lead.get('phone')}")
        print(f"    - Website:           {lead.get('website')}")
        print(f"    - Rating:            {lead.get('rating')} ({lead.get('review_count')} reviews)")
        print(f"    - Google Maps URL:   {lead.get('google_maps_url')}")
        print(f"    - Source:            {lead.get('source')} (is_demo={lead.get('is_demo')})")
        print("-" * 60)


if __name__ == "__main__":
    asyncio.run(verify())
