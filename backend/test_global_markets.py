import asyncio
import logging
from app.database.session import SessionLocal, engine, Base
from app.models.user import User
from app.schemas.search import SearchCreate
from app.routes.search_routes import execute_lead_search

logging.basicConfig(level=logging.INFO)

TEST_CASES = [
    {
        "test_name": "India: Tamil Nadu -> Chennai",
        "country": "India",
        "country_code": "IN",
        "state": "Tamil Nadu",
        "region": "Chennai",
        "category": "Software Companies",
        "radius_km": 20.0,
        "max_results": 100
    },
    {
        "test_name": "USA: California -> San Francisco",
        "country": "United States",
        "country_code": "US",
        "state": "California",
        "region": "San Francisco",
        "category": "Software Companies",
        "radius_km": 20.0,
        "max_results": 100
    },
    {
        "test_name": "USA: Texas -> Houston",
        "country": "United States",
        "country_code": "US",
        "state": "Texas",
        "region": "Houston",
        "category": "Software Companies",
        "radius_km": 20.0,
        "max_results": 100
    },
    {
        "test_name": "Australia: New South Wales -> Sydney",
        "country": "Australia",
        "country_code": "AU",
        "state": "New South Wales",
        "region": "Sydney",
        "category": "Software Companies",
        "radius_km": 20.0,
        "max_results": 100
    },
    {
        "test_name": "Japan: Tokyo -> Tokyo",
        "country": "Japan",
        "country_code": "JP",
        "state": "Tokyo",
        "region": "Tokyo",
        "category": "Software Companies",
        "radius_km": 20.0,
        "max_results": 100
    },
    {
        "test_name": "Japan: Osaka -> Osaka",
        "country": "Japan",
        "country_code": "JP",
        "state": "Osaka",
        "region": "Osaka",
        "category": "Software Companies",
        "radius_km": 20.0,
        "max_results": 100
    },
    {
        "test_name": "United Kingdom: England -> London",
        "country": "United Kingdom",
        "country_code": "GB",
        "state": "England",
        "region": "London",
        "category": "Software Companies",
        "radius_km": 20.0,
        "max_results": 100
    },
    {
        "test_name": "United Kingdom: Scotland -> Edinburgh",
        "country": "United Kingdom",
        "country_code": "GB",
        "state": "Scotland",
        "region": "Edinburgh",
        "category": "Software Companies",
        "radius_km": 20.0,
        "max_results": 100
    },
    {
        "test_name": "Singapore: Whole Singapore Area -> Singapore",
        "country": "Singapore",
        "country_code": "SG",
        "state": "Whole Singapore Area",
        "region": "Singapore",
        "category": "Software Companies",
        "radius_km": 20.0,
        "max_results": 100
    }
]


async def run_full_location_audit_suite():
    print("\n==================================================================================")
    print("      REAL PRODUCTION TEST SUITE FOR GLOBAL LOCATION DROPDOWN EXPANSION          ")
    print("==================================================================================\n")

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        user = db.query(User).filter(User.email == "test_admin@leadscraper.com").first()
        if not user:
            user = User(
                email="test_admin@leadscraper.com",
                hashed_password="test_password_hash",
                full_name="Test Admin User",
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        for tc in TEST_CASES:
            print(f"\n----------------------------------------------------------------------------------")
            print(f"RUNNING TEST: {tc['test_name']}")
            print(f"  - Location: {tc['region']}, {tc['state'] or 'N/A'}, {tc['country']} ({tc['country_code']})")
            print(f"  - Category: {tc['category']} | Radius: {tc['radius_km']} KM | Max: {tc['max_results']}")
            print(f"----------------------------------------------------------------------------------")

            payload = SearchCreate(
                country=tc["country"],
                country_code=tc["country_code"],
                state=tc["state"],
                region=tc["region"],
                category=tc["category"],
                radius_km=tc["radius_km"],
                max_results=tc["max_results"]
            )

            response = await execute_lead_search(search_in=payload, db=db, current_user=user)

            summary = response["summary"]
            leads = response["leads"]

            print(f"\nRESULTS FOR {tc['test_name']}:")
            print(f"  Total Leads:   {summary['total_leads']}")
            print(f"  With Phone:    {summary['with_phone']}")
            print(f"  With Website:  {summary['with_website']}")
            print(f"  With Email:    {summary['with_email']}")
            print(f"  Without Email: {summary['without_email']}")

            print("\n3 SAMPLE REAL BUSINESSES:")
            for idx, lead in enumerate(leads[:3], 1):
                email_src = lead.email_source_url if (lead.email and lead.email != "Not Available") else "N/A"
                print(f"  Sample #{idx}: {lead.company_name}")
                print(f"    - Place ID:        {lead.provider_place_id}")
                print(f"    - Address:         {lead.address}")
                print(f"    - Phone:           {lead.phone}")
                print(f"    - Website:         {lead.website}")
                print(f"    - Email:           {lead.email}")
                print(f"    - Email Source URL:{email_src}")

        print("\n==================================================================================")
        print("                 GLOBAL LOCATION AUDIT SUITE COMPLETED                            ")
        print("==================================================================================")

    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(run_full_location_audit_suite())
