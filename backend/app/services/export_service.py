import io
import pandas as pd
from typing import List
from app.models.lead import Lead


def generate_export_dataframe(leads: List[Lead]) -> pd.DataFrame:
    data = []
    for lead in leads:
        data.append({
            "Company Name": lead.company_name,
            "Category": lead.category,
            "Phone": lead.phone or "Not Available",
            "Email": lead.email or "Not Available",
            "Website": lead.website or "Not Available",
            "Address": lead.address,
            "City": lead.city or "Not Available",
            "State": lead.state or "Not Available",
            "Country": lead.country or "India",
            "Rating": lead.rating if lead.rating is not None else "N/A",
            "Review Count": lead.review_count,
            "Business Status": lead.business_status or "OPERATIONAL",
            "Lead Status": lead.lead_status or "New",
            "Source": lead.source or "Google Places API",
            "Collected At": lead.collected_at.strftime("%Y-%m-%d %H:%M:%S") if lead.collected_at else "N/A"
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
