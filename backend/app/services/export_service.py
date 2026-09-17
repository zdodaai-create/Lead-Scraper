import io
import pandas as pd
from typing import List
from app.models.lead import Lead


def generate_export_dataframe(leads: List[Lead]) -> pd.DataFrame:
    data = []
    for lead in leads:
        data.append({
            "profileUrl": getattr(lead, "profile_url", None) or getattr(lead, "google_maps_url", None) or "",
            "fullName": getattr(lead, "full_name", None) or getattr(lead, "name", None) or "",
            "firstName": getattr(lead, "first_name", None) or "",
            "lastName": getattr(lead, "last_name", None) or "",
            "companyName": getattr(lead, "company_name", "") or "",
            "title": getattr(lead, "title", None) or getattr(lead, "category", "") or "",
            "companyId": getattr(lead, "company_id", None) or "",
            "companyUrl": getattr(lead, "company_url", None) or getattr(lead, "website", None) or "",
            "regularCompanyUrl": getattr(lead, "regular_company_url", None) or getattr(lead, "company_url", None) or getattr(lead, "website", None) or "",
            "summary": getattr(lead, "summary", None) or getattr(lead, "notes", None) or "",
            "titleDescription": getattr(lead, "title_description", None) or "",
            "industry": getattr(lead, "industry", None) or getattr(lead, "category", "") or "",
            "companyLocation": getattr(lead, "company_location", None) or getattr(lead, "city", None) or getattr(lead, "address", None) or "",
            "location": getattr(lead, "location", None) or getattr(lead, "city", None) or getattr(lead, "address", None) or "",
            "durationInRole": getattr(lead, "duration_in_role", None) or "",
            "durationInCompany": getattr(lead, "duration_in_company", None) or "",
            "pastExperienceCompanyName": getattr(lead, "past_experience_company_name", None) or "",
            "pastExperienceCompanyUrl": getattr(lead, "past_experience_company_url", None) or "",
            "pastExperienceCompanyTitle": getattr(lead, "past_experience_company_title", None) or "",
            "pastExperienceDate": getattr(lead, "past_experience_date", None) or "",
            "pastExperienceDuration": getattr(lead, "past_experience_duration", None) or "",
            "connectionDegree": getattr(lead, "connection_degree", None) or "",
            "profileImageUrl": getattr(lead, "profile_image_url", None) or "",
            "sharedConnectionsCount": getattr(lead, "shared_connections_count", None) if getattr(lead, "shared_connections_count", None) is not None else 0,
            "name": getattr(lead, "name", None) or getattr(lead, "full_name", None) or getattr(lead, "company_name", "") or "",
            "vmid": getattr(lead, "vmid", None) or "",
            "linkedInProfileUrl": getattr(lead, "linkedin_profile_url", None) or getattr(lead, "profile_url", None) or "",
            "isPremium": getattr(lead, "is_premium", False),
            "isOpenLink": getattr(lead, "is_open_link", False),
            "query": getattr(lead, "query", None) or "",
            "timestamp": getattr(lead, "timestamp", None) or (lead.collected_at.strftime("%Y-%m-%d %H:%M:%S") if getattr(lead, "collected_at", None) else ""),
            "defaultProfileUrl": getattr(lead, "default_profile_url", None) or getattr(lead, "profile_url", None) or getattr(lead, "google_maps_url", None) or "",
            "searchAccountProfileId": getattr(lead, "search_account_profile_id", None) or "",
            "searchAccountProfileName": getattr(lead, "search_account_profile_name", None) or "",
            "sys3 status": getattr(lead, "sys3_status", None) or getattr(lead, "lead_status", "New") or "",
            # Additional Contact & Rating Attributes
            "phone": lead.phone or "Not Available",
            "email": lead.email or "Not Available",
            "website": lead.website or "Not Available",
            "address": lead.address or "",
            "rating": lead.rating if lead.rating is not None else "N/A",
            "reviewCount": lead.review_count or 0,
            "source": lead.source or "Google Places API"
        })
    return pd.DataFrame(data)


def export_to_excel(leads: List[Lead]) -> bytes:
    df = generate_export_dataframe(leads)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Leads")
    output.seek(0)
    return output.getvalue()


def export_to_csv(leads: List[Lead]) -> bytes:
    df = generate_export_dataframe(leads)
    output = io.BytesIO()
    csv_str = df.to_csv(index=False)
    output.write(csv_str.encode("utf-8-sig"))  # UTF-8 with BOM for Excel compatibility
    output.seek(0)
    return output.getvalue()
