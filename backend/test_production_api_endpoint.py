import asyncio
import logging
from app.database.session import SessionLocal, engine, Base
from app.models.user import User
from app.schemas.search import SearchCreate
from app.routes.search_routes import execute_lead_search

logging.basicConfig(level=logging.INFO)


async def run_live_contact_pipeline_test():
    print("\n==================================================================================")
    print("        REAL PRODUCTION LEAD FINDER END-TO-END CONTACT PIPELINE TEST             ")
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

        payload = SearchCreate(
            country="India",
            state="Tamil Nadu",
            region="Chennai",
            category="Software Companies",
            radius_km=20.0,
            max_results=100
        )

        print(f"Executing POST /api/search with payload:")
        print(f"  - Region:      '{payload.region}'")
        print(f"  - Category:    '{payload.category}'")
        print(f"  - Radius:      {payload.radius_km} KM")
        print(f"  - Max Results: {payload.max_results}\n")

        # Execute FastAPI search route handler
        response = await execute_lead_search(search_in=payload, db=db, current_user=user)

        summary = response["summary"]
        leads = response["leads"]

        print("==================================================================================")
        print("                  ACTUAL PRODUCTION PIPELINE METRICS REPORT                       ")
        print("==================================================================================")
        print(f"Total leads returned: {summary['total_leads']}")
        print(f"With phone:           {summary['with_phone']}")
        print(f"With website:         {summary['with_website']}")
        print(f"With email:           {summary['with_email']}")
        print(f"Without email:        {summary['without_email']}")
        print("==================================================================================")

        print("\n==================================================================================")
        print("                     5 SAMPLE REAL PRODUCTION RECORDS                             ")
        print("==================================================================================")

        for idx, lead in enumerate(leads[:5], 1):
            print(f"\nSample #{idx}: {lead.company_name}")
            print(f"  - Google Place ID: {lead.provider_place_id}")
            print(f"  - Address:         {lead.address}")
            print(f"  - Phone:           {lead.phone}")
            print(f"  - Website:         {lead.website}")
            print(f"  - Email:           {lead.email}")

    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(run_live_contact_pipeline_test())
