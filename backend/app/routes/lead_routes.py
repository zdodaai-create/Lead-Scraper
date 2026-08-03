from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.database.session import get_db
from app.models.user import User
from app.models.lead import Lead
from app.schemas.lead import LeadOut, LeadUpdate, LeadListResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/leads", tags=["Leads Management"])


@router.get("", response_model=LeadListResponse)
def get_leads(
    search_query: Optional[str] = Query(None, alias="query"),
    company_name: Optional[str] = None,
    category: Optional[str] = None,
    city: Optional[str] = None,
    min_rating: Optional[float] = None,
    has_email: Optional[bool] = None,
    has_phone: Optional[bool] = None,
    has_website: Optional[bool] = None,
    lead_status: Optional[str] = None,
    search_id: Optional[int] = None,
    sort_by: str = Query("collected_at", regex="^(rating|review_count|company_name|collected_at)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves, filters, sorts, and paginates user leads with summary cards data.
    """
    query_builder = db.query(Lead).filter(Lead.user_id == current_user.id)

    if search_id:
        query_builder = query_builder.filter(Lead.search_id == search_id)

    if search_query:
        term = f"%{search_query}%"
        query_builder = query_builder.filter(
            or_(
                Lead.company_name.ilike(term),
                Lead.category.ilike(term),
                Lead.phone.ilike(term),
                Lead.email.ilike(term),
                Lead.city.ilike(term),
                Lead.address.ilike(term)
            )
        )

    if company_name:
        query_builder = query_builder.filter(Lead.company_name.ilike(f"%{company_name}%"))

    if category:
        query_builder = query_builder.filter(Lead.category.ilike(f"%{category}%"))

    if city:
        query_builder = query_builder.filter(Lead.city.ilike(f"%{city}%"))

    if min_rating is not None:
        query_builder = query_builder.filter(Lead.rating >= min_rating)

    if has_email is True:
        query_builder = query_builder.filter(Lead.email != "Not Available", Lead.email.isnot(None), Lead.email != "")
    elif has_email is False:
        query_builder = query_builder.filter(or_(Lead.email == "Not Available", Lead.email.is_(None), Lead.email == ""))

    if has_phone is True:
        query_builder = query_builder.filter(Lead.phone != "Not Available", Lead.phone.isnot(None), Lead.phone != "")
    elif has_phone is False:
        query_builder = query_builder.filter(or_(Lead.phone == "Not Available", Lead.phone.is_(None), Lead.phone == ""))

    if has_website is True:
        query_builder = query_builder.filter(Lead.website != "Not Available", Lead.website.isnot(None), Lead.website != "")
    elif has_website is False:
        query_builder = query_builder.filter(or_(Lead.website == "Not Available", Lead.website.is_(None), Lead.website == ""))

    if lead_status:
        query_builder = query_builder.filter(Lead.lead_status == lead_status)

    # Compute Summary Stats before pagination
    all_filtered_leads = query_builder.all()
    total_count = len(all_filtered_leads)

    with_phone = sum(1 for l in all_filtered_leads if l.phone and l.phone != "Not Available")
    with_email = sum(1 for l in all_filtered_leads if l.email and l.email != "Not Available")
    with_website = sum(1 for l in all_filtered_leads if l.website and l.website != "Not Available")
    without_email = total_count - with_email

    # Sorting
    sort_column = getattr(Lead, sort_by, Lead.collected_at)
    if sort_order == "desc":
        query_builder = query_builder.order_by(desc(sort_column))
    else:
        query_builder = query_builder.order_by(asc(sort_column))

    # Pagination
    offset = (page - 1) * limit
    paginated_items = query_builder.offset(offset).limit(limit).all()
    total_pages = (total_count + limit - 1) // limit if limit > 0 else 1

    return {
        "items": [LeadOut.model_validate(l) for l in paginated_items],
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "summary": {
            "total_leads": total_count,
            "with_phone": with_phone,
            "with_email": with_email,
            "with_website": with_website,
            "without_email": without_email
        }
    }


@router.get("/{id}", response_model=LeadOut)
def get_lead_details(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lead = db.query(Lead).filter(Lead.id == id, Lead.user_id == current_user.id).first()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return lead


@router.patch("/{id}", response_model=LeadOut)
def update_lead(
    id: int,
    lead_update: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lead = db.query(Lead).filter(Lead.id == id, Lead.user_id == current_user.id).first()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    if lead_update.lead_status is not None:
        lead.lead_status = lead_update.lead_status
    if lead_update.notes is not None:
        lead.notes = lead_update.notes
    if lead_update.phone is not None:
        lead.phone = lead_update.phone
    if lead_update.email is not None:
        lead.email = lead_update.email

    db.commit()
    db.refresh(lead)
    return lead


@router.delete("/{id}")
def delete_lead(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lead = db.query(Lead).filter(Lead.id == id, Lead.user_id == current_user.id).first()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    db.delete(lead)
    db.commit()
    return {"message": "Lead deleted successfully"}


@router.post("/batch-delete")
def batch_delete_leads(
    lead_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    leads = db.query(Lead).filter(Lead.id.in_(lead_ids), Lead.user_id == current_user.id).all()
    count = len(leads)
    for l in leads:
        db.delete(l)
    db.commit()
    return {"message": f"Successfully deleted {count} leads"}
