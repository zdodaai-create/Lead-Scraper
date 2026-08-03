from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SearchCreate(BaseModel):
    name: Optional[str] = None
    country: str = "India"
    state: Optional[str] = "Kerala"
    region: str = "Trivandrum"
    category: str = "Software Companies"
    radius_km: float = Field(default=20.0, ge=0.5, le=100.0)
    max_results: int = Field(default=100, ge=1, le=500)
    min_rating: Optional[float] = Field(default=None, ge=0.0, le=5.0)
    has_phone: bool = False
    has_website: bool = False
    has_email: bool = False


class SearchOut(BaseModel):
    id: int
    user_id: int
    name: str
    country: str
    state: Optional[str]
    region: str
    category: str
    radius_km: float
    max_results: int
    min_rating: Optional[float]
    has_phone: bool
    has_website: bool
    has_email: bool
    created_at: datetime

    class Config:
        from_attributes = True
