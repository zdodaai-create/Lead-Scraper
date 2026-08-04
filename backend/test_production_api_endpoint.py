import asyncio
import logging
from app.database.session import SessionLocal, engine, Base
from app.models.user import User
from app.schemas.search import SearchCreate
from app.routes.search_routes import execute_lead_search

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_prod_api")


async def run_production_api_search_test():
    print("\n==================================================================================")
    print("      EXECUTING LIVE PRODUCTION /api/search ENDPOINT VERIFICATION TEST           ")
    print("==================================================================================\n")

    # 1. Prepare DB and test user
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

        # 2. Construct Search Payload matching exact UI request
        payload = SearchCreate(
            country="India",
            state="Tamil Nadu",
            region="Chennai",
            category="Software Companies",
            radius_km=20.0,
            max_results=100
        )

        print(f"--> Sending payload to execute_lead_search (/api/search):")
        print(f"    - country:     '{payload.country}'")
        print(f"    - state:       '{payload.state}'")
        print(f"    - region:      '{payload.region}'")
        print(f"    - category:    '{payload.category}'")
        print(f"    - radius_km:   {payload.radius_km}")
        print(f"    - max_results: {payload.max_results}\n")

        # 3. Call actual FastAPI route handler
        response = await execute_lead_search(search_in=payload, db=db, current_user=user)

        # 4. Extract metrics & results
        search_record = response["search"]
        summary = response["summary"]
        leads = response["leads"]

        print("==================================================================================")
        print("                PRODUCTION /api/search ENDPOINT RESPONSE REPORT                   ")
        print("==================================================================================")
        print(f"Search ID Created in DB:      {search_record.id}")
        print(f"Frontend Requested max_results: 100")
        print(f"Backend Received max_results:   {search_record.max_results}")
        print(f"Backend Received radius_km:     {search_record.radius_km} KM")
        print(f"Total Leads Saved to DB:        {len(leads)}")
        print(f"Returned Summary total_leads:   {summary['total_leads']}")
        print(f"Returned Summary with_phone:    {summary['with_phone']}")
        print(f"Returned Summary with_website:  {summary['with_website']}")
        print(f"Returned Summary with_email:    {summary['with_email']}")
        print("==================================================================================")

        print("\nFIRST 5 SAMPLE LEADS FROM /api/search ENDPOINT RESPONSE:")
        for idx, l in enumerate(leads[:5], 1):
            print(f" [{idx}] {l.company_name}")
            print(f"     - Place ID:    {l.provider_place_id}")
            print(f"     - Address:     {l.address}")
            print(f"     - Phone:       {l.phone}")
            print(f"     - Website:     {l.website}")
            print(f"     - Email:       {l.email}")

    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(run_production_api_search_test())
