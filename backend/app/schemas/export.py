from pydantic import BaseModel
from typing import Optional, List


class ExportRequest(BaseModel):
    lead_ids: Optional[List[int]] = None
    search_id: Optional[int] = None
    format: str = "excel"  # excel or csv
