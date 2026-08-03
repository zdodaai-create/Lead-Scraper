import asyncio
import logging
from app.services.places_service import search_business_leads
from app.services.website_service import enrich_lead_from_website
from app.services.deduplicator import deduplicate_leads

logging.basicConfig(level=logging.INFO)


async def run_live_lead_finder_test():
    region = "Chennai"
    category = "Software Companies"
    radius_km = 20.0
    max_results = 10

    print(f"\n==================================================")
    print(f"   RUNNING LIVE LEAD FINDER TEST FOR: {region} + {category}")
    print(f"==================================================\n")

    # 1. Fetch live Google Places API data
    places_leads = await search_business_leads(region, category, radius_km, max_results)
    print(f"--> Places API returned: {len(places_leads)} leads\n")

    if not places_leads:
        print("❌ No leads returned by Google Places API. Check API key status.")
        return

    # 2. Enrich website details
    enriched = []
    for item in places_leads[:5]:
        website = item.get("website")
        if website and website != "Not Available":
            res = await enrich_lead_from_website(website)
            if res.get("email") != "Not Available":
                item["email"] = res["email"]
                item["email_source_url"] = res.get("email_source_url")

        enriched.append(item)

    # 3. Print verified leads report
    print(f"=== VERIFIED LIVE LEADS REPORT ({len(enriched)} Samples) ===\n")
    for idx, lead in enumerate(enriched, 1):
        print(f"[{idx}] {lead.get('company_name')}")
        print(f"    - Place ID:        {lead.get('provider_place_id')}")
        print(f"    - Phone:           {lead.get('phone')}")
        print(f"    - Email:           {lead.get('email')}")
        if lead.get('email_source_url'):
            print(f"    - Email Source:    {lead.get('email_source_url')}")
        print(f"    - Website:         {lead.get('website')}")
        print(f"    - Address:         {lead.get('address')}")
        print(f"    - Rating:          {lead.get('rating')} ({lead.get('review_count')} reviews)")
        print(f"    - Google Maps:     {lead.get('google_maps_url')}")
        print(f"    - Verification:    {lead.get('source')} (is_demo={lead.get('is_demo')})")
        print("-" * 60)


if __name__ == "__main__":
    asyncio.run(run_live_lead_finder_test())
