import asyncio
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.database.session import get_db
from app.models.user import User
from app.models.search import Search
from app.models.lead import Lead
from app.schemas.search import SearchCreate, SearchOut
from app.schemas.lead import LeadOut
from app.services.auth_service import get_current_user
from app.services.places_service import search_business_leads, is_demo_mode_active
from app.services.website_service import enrich_lead_from_website
from app.services.deduplicator import deduplicate_leads

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Searches & Discovery"])


@router.post("/search")
async def execute_lead_search(
    search_in: SearchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Executes live business lead discovery & website contact enrichment pipeline.
    Preserves exact HTTP status codes (400, 403, 429, 502) from Google Places API.
    """
    search_name = search_in.name or f"{search_in.region} - {search_in.category}"

    # 1. Store Search Record
    try:
        db_search = Search(
            user_id=current_user.id,
            name=search_name,
            country=search_in.country,
            state=search_in.state,
            region=search_in.region,
            category=search_in.category,
            radius_km=search_in.radius_km,
            max_results=search_in.max_results,
            min_rating=search_in.min_rating,
            has_phone=search_in.has_phone,
            has_website=search_in.has_website,
            has_email=search_in.has_email,
            created_at=datetime.utcnow()
        )
        db.add(db_search)
        db.commit()
        db.refresh(db_search)
    except Exception as e:
        db.rollback()
        logger.error(f"Error persisting search record: {e}")
        raise HTTPException(status_code=400, detail=f"Database error storing search: {e}")

    # 2. Fetch Places Data (Preserves exact Google HTTP 400/403/429 status code)
    raw_leads = await search_business_leads(
        region=search_in.region,
        category=search_in.category,
        radius_km=search_in.radius_km,
        max_results=search_in.max_results
    )

    # 3. Async Website Contact Enrichment
    enrich_tasks = []
    for item in raw_leads:
        website = item.get("website")
        if website and website != "Not Available":
            enrich_tasks.append(enrich_lead_from_website(website))
        else:
            enrich_tasks.append(asyncio.sleep(0, result={
                "email": "Not Available",
                "phone": "Not Available",
                "website_source_url": None,
                "email_source_url": None,
                "contact_page_url": None
            }))

    enrich_results = await asyncio.gather(*enrich_tasks, return_exceptions=True)

    enriched_leads = []
    for i, item in enumerate(raw_leads):
        res = enrich_results[i]
        if isinstance(res, dict):
            if item.get("phone") == "Not Available" and res.get("phone") != "Not Available":
                item["phone"] = res["phone"]
            if res.get("email") and res.get("email") != "Not Available":
                item["email"] = res["email"]
            if res.get("email_source_url"):
                item["email_source_url"] = res["email_source_url"]
            if res.get("website_source_url"):
                item["website_source_url"] = res["website_source_url"]
            if res.get("contact_page_url"):
                item["contact_page_url"] = res["contact_page_url"]

        enriched_leads.append(item)

    # 4. Multi-Criteria Deduplication
    unique_leads = deduplicate_leads(enriched_leads)

    # 5. Apply User Filter Parameters
    final_leads = []
    for item in unique_leads:
        rating = item.get("rating")
        phone = item.get("phone", "Not Available")
        website = item.get("website", "Not Available")
        email = item.get("email", "Not Available")

        if search_in.min_rating is not None and (rating is None or rating < search_in.min_rating):
            continue
        if search_in.has_phone and (not phone or phone == "Not Available"):
            continue
        if search_in.has_website and (not website or website == "Not Available"):
            continue
        if search_in.has_email and (not email or email == "Not Available"):
            continue

        final_leads.append(item)

    # 6. Safe Bulk Insert to Database
    now_time = datetime.utcnow()
    saved_lead_objects = []
    for item in final_leads:
        lead_obj = Lead(
            search_id=db_search.id,
            user_id=current_user.id,
            company_name=item.get("company_name", "Not Available"),
            category=item.get("category", search_in.category),
            phone=item.get("phone", "Not Available"),
            email=item.get("email", "Not Available"),
            website=item.get("website", "Not Available"),
            address=item.get("address", search_in.region),
            city=item.get("city", search_in.region),
            state=search_in.state,
            country=search_in.country,
            postal_code=item.get("postal_code", "Not Available"),
            latitude=item.get("latitude"),
            longitude=item.get("longitude"),
            rating=item.get("rating"),
            review_count=item.get("review_count", 0),
            business_status=item.get("business_status", "OPERATIONAL"),
            provider_place_id=item.get("provider_place_id"),
            places_source=item.get("places_source", True),
            is_demo=item.get("is_demo", False),
            website_source_url=item.get("website_source_url"),
            email_source_url=item.get("email_source_url"),
            contact_page_url=item.get("contact_page_url"),
            google_maps_url=item.get("google_maps_url"),
            source="Google Places API",
            lead_status="New",
            notes=None,
            collected_at=now_time,
            fetched_at=now_time
        )
        saved_lead_objects.append(lead_obj)

    try:
        db.add_all(saved_lead_objects)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error persisting lead objects to DB: {e}")
        raise HTTPException(status_code=400, detail=f"Database lead persistence error: {e}")

    # Metrics summary calculation
    total_leads = len(saved_lead_objects)
    with_phone = sum(1 for l in saved_lead_objects if l.phone and l.phone != "Not Available")
    with_email = sum(1 for l in saved_lead_objects if l.email and l.email != "Not Available")
    with_website = sum(1 for l in saved_lead_objects if l.website and l.website != "Not Available")
    without_email = total_leads - with_email

    return {
        "search": SearchOut.model_validate(db_search),
        "demo_mode": False,
        "summary": {
            "total_leads": total_leads,
            "with_phone": with_phone,
            "with_email": with_email,
            "with_website": with_website,
            "without_email": without_email
        },
        "leads": [LeadOut.model_validate(l) for l in saved_lead_objects]
    }


@router.get("/searches", response_model=List[SearchOut])
def get_user_searches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Search).filter(Search.user_id == current_user.id).order_by(Search.created_at.desc()).all()


@router.get("/searches/{id}", response_model=SearchOut)
def get_search_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    search_item = db.query(Search).filter(Search.id == id, Search.user_id == current_user.id).first()
    if not search_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Search not found")
    return search_item


@router.delete("/searches/{id}")
def delete_saved_search(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    search_item = db.query(Search).filter(Search.id == id, Search.user_id == current_user.id).first()
    if not search_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Search not found")
    db.delete(search_item)
    db.commit()
    return {"message": "Search deleted successfully"}
