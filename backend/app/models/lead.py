from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    search_id = Column(Integer, ForeignKey("searches.id"), index=True, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    
    company_name = Column(String(255), index=True, nullable=False)
    category = Column(String(255), index=True, nullable=False)
    phone = Column(String(100), default="Not Available")
    email = Column(String(255), default="Not Available", index=True)
    website = Column(String(500), default="Not Available")
    address = Column(Text, nullable=False)
    city = Column(String(100), index=True, nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), default="India")
    country_code = Column(String(10), default="IN", index=True, nullable=True)
    postal_code = Column(String(50), default="Not Available")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    rating = Column(Float, nullable=True, index=True)
    review_count = Column(Integer, default=0, index=True)
    business_status = Column(String(50), default="OPERATIONAL")
    
    # Audit & Verification Fields
    provider_place_id = Column(String(255), index=True, nullable=True)
    places_source = Column(Boolean, default=True)
    is_demo = Column(Boolean, default=False, index=True)
    website_source_url = Column(String(500), nullable=True)
    email_source_url = Column(String(500), nullable=True)
    contact_page_url = Column(String(500), nullable=True)
    google_maps_url = Column(String(500), nullable=True)
    source = Column(String(100), default="Google Places API")
    
    lead_status = Column(String(50), default="New", index=True)
    notes = Column(Text, nullable=True)
    collected_at = Column(DateTime, default=datetime.utcnow, index=True)
    fetched_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="leads")
    search = relationship("Search", back_populates="leads")
