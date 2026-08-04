import asyncio
import logging
import random
from app.services.places_service import search_business_leads, geocode_location, generate_search_grid
import httpx

logging.basicConfig(level=logging.INFO, format="%(message)s")


async def run_coverage_tests():
    category = "Software Companies"
    region = "Chennai"
    radii = [20.0, 50.0, 100.0, 200.0]

    print("\n==================================================================================")
    print("      GOOGLE PLACES LEAD DISCOVERY COVERAGE & RADIUS BENCHMARK SUITE             ")
    print("==================================================================================\n")

    test_reports = []
    all_returned_leads = []

    for r in radii:
        print(f"\n---> RUNNING TEST CASE: {category} | Location: {region} | Radius: {r} KM")
        max_res = 1000  # Set to maximum available to test full geographic coverage

        leads = await search_business_leads(region, category, r, max_res)
        all_returned_leads.extend(leads)

        # Print basic result count
        print(f"     Results Received: {len(leads)} businesses")

    print("\n\n==================================================================================")
    print("                 VERIFYING REAL GOOGLE PLACES DATA (RANDOM 10 SAMPLE)             ")
    print("==================================================================================")

    # Randomly select 10 unique businesses from all returned leads
    unique_pool = {l.get("provider_place_id"): l for l in all_returned_leads if l.get("provider_place_id")}.values()
    sample_size = min(10, len(unique_pool))
    sampled_leads = random.sample(list(unique_pool), sample_size) if sample_size > 0 else []

    for idx, lead in enumerate(sampled_leads, 1):
        print(f"\n[{idx}] Business Name:  {lead.get('company_name')}")
        print(f"    - Google Place ID: {lead.get('provider_place_id')}")
        print(f"    - Lat / Long:      ({lead.get('latitude')}, {lead.get('longitude')})")
        print(f"    - Address:         {lead.get('address')}")
        print(f"    - Phone:           {lead.get('phone')}")
        print(f"    - Website:         {lead.get('website')}")
        print(f"    - Rating / Count:  {lead.get('rating')} ({lead.get('review_count')} reviews)")
        print(f"    - Google Maps:     {lead.get('google_maps_url')}")
        print("    ----------------------------------------------------------------------")


if __name__ == "__main__":
    asyncio.run(run_coverage_tests())
