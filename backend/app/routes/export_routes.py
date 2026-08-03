from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
import datetime

from app.database.session import get_db
from app.models.user import User
from app.models.lead import Lead
from app.schemas.export import ExportRequest
from app.services.auth_service import get_current_user
from app.services.export_service import export_to_excel, export_to_csv

router = APIRouter(prefix="/api/export", tags=["Exports"])


def fetch_export_leads(
    db: Session,
    user_id: int,
    search_id: Optional[int] = None,
    lead_ids: Optional[List[int]] = None
) -> List[Lead]:
    query = db.query(Lead).filter(Lead.user_id == user_id)
    if search_id:
        query = query.filter(Lead.search_id == search_id)
    if lead_ids:
        query = query.filter(Lead.id.in_(lead_ids))
    return query.order_by(Lead.collected_at.desc()).all()


@router.get("/excel")
def export_leads_excel(
    search_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    leads = fetch_export_leads(db, current_user.id, search_id=search_id)
    if not leads:
        raise HTTPException(status_code=404, detail="No leads found for export")

    excel_data = export_to_excel(leads)
    filename = f"leads_export_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

    return Response(
        content=excel_data,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/csv")
def export_leads_csv(
    search_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    leads = fetch_export_leads(db, current_user.id, search_id=search_id)
    if not leads:
        raise HTTPException(status_code=404, detail="No leads found for export")

    csv_data = export_to_csv(leads)
    filename = f"leads_export_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.post("")
def export_selected_leads(
    req: ExportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    leads = fetch_export_leads(db, current_user.id, search_id=req.search_id, lead_ids=req.lead_ids)
    if not leads:
        raise HTTPException(status_code=404, detail="No leads found for export")

    fmt = req.format.lower()
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

    if fmt == "excel" or fmt == "xlsx":
        content = export_to_excel(leads)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = f"lead_finder_export_{timestamp}.xlsx"
    else:
        content = export_to_csv(leads)
        media_type = "text/csv"
        filename = f"lead_finder_export_{timestamp}.csv"

    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
