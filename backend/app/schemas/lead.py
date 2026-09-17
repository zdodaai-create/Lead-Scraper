from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class LeadBase(BaseModel):
    company_name: str
    category: str
    phone: str = "Not Available"
    email: str = "Not Available"
    website: str = "Not Available"
    address: str
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "India"
    country_code: Optional[str] = "IN"
    postal_code: str = "Not Available"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rating: Optional[float] = None
    review_count: int = 0
    business_status: str = "OPERATIONAL"
    provider_place_id: Optional[str] = None
    places_source: bool = True
    is_demo: bool = False
    website_source_url: Optional[str] = None
    email_source_url: Optional[str] = None
    contact_page_url: Optional[str] = None
    google_maps_url: Optional[str] = None
    source: str = "Google Places API"
    lead_status: str = "New"
    notes: Optional[str] = None
    
    # Core & Extended Profile Fields (35 Scraping Export Attributes)
    profile_url: Optional[str] = None
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    title: Optional[str] = None
    company_id: Optional[str] = None
    company_url: Optional[str] = None
    regular_company_url: Optional[str] = None
    summary: Optional[str] = None
    title_description: Optional[str] = None
    industry: Optional[str] = None
    company_location: Optional[str] = None
    location: Optional[str] = None
    duration_in_role: Optional[str] = None
    duration_in_company: Optional[str] = None
    past_experience_company_name: Optional[str] = None
    past_experience_company_url: Optional[str] = None
    past_experience_company_title: Optional[str] = None
    past_experience_date: Optional[str] = None
    past_experience_duration: Optional[str] = None
    connection_degree: Optional[str] = None
    profile_image_url: Optional[str] = None
    shared_connections_count: Optional[int] = 0
    name: Optional[str] = None
    vmid: Optional[str] = None
    linkedin_profile_url: Optional[str] = None
    is_premium: Optional[bool] = False
    is_open_link: Optional[bool] = False
    query: Optional[str] = None
    timestamp: Optional[str] = None
    phone_number: Optional[str] = None
    default_profile_url: Optional[str] = None
    search_account_profile_id: Optional[str] = None
    search_account_profile_name: Optional[str] = None
    sys3_status: Optional[str] = None


class LeadOut(LeadBase):
    id: int
    search_id: Optional[int] = None
    user_id: int
    collected_at: datetime
    fetched_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LeadUpdate(BaseModel):
    lead_status: Optional[str] = None
    notes: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class LeadFilterParams(BaseModel):
    company_name: Optional[str] = None
    category: Optional[str] = None
    city: Optional[str] = None
    min_rating: Optional[float] = None
    has_email: Optional[bool] = None
    has_phone: Optional[bool] = None
    has_website: Optional[bool] = None
    lead_status: Optional[str] = None
    search_id: Optional[int] = None
    sort_by: Optional[str] = "collected_at"
    sort_order: Optional[str] = "desc"
    page: int = 1
    limit: int = 50


class LeadListResponse(BaseModel):
    items: List[LeadOut]
    total: int
    page: int
    limit: int
    total_pages: int
    summary: dict
