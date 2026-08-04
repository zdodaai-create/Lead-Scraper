from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base


class Search(Base):
    __tablename__ = "searches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    name = Column(String(255), nullable=False)
    country = Column(String(100), default="India")
    country_code = Column(String(10), default="IN", nullable=True)
    state = Column(String(100), nullable=True)
    region = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)
    radius_km = Column(Float, default=20.0)
    max_results = Column(Integer, default=100)
    min_rating = Column(Float, nullable=True)
    has_phone = Column(Boolean, default=False)
    has_website = Column(Boolean, default=False)
    has_email = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="searches")
    leads = relationship("Lead", back_populates="search")
