"""Report generation routes."""
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.schemas import Holding, RiskMetrics
from app.services.pdf_report import generate_pdf_report
from pydantic import BaseModel
from typing import Optional


class ReportRequest(BaseModel):
    holdings: list[Holding]
    risk_metrics: Optional[RiskMetrics] = None
    commentary: Optional[str] = None
    monte_carlo_stats: Optional[dict] = None


router = APIRouter()


@router.post("/pdf")
async def generate_pdf(req: ReportRequest):
    """Generate and download PDF risk report."""
    try:
        pdf_bytes = generate_pdf_report(
            holdings=req.holdings,
            risk_metrics=req.risk_metrics,
            commentary=req.commentary,
            monte_carlo_stats=req.monte_carlo_stats,
        )
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=blackrock_risk_report.pdf"
            },
        )
    except Exception as e:
        raise HTTPException(500, f"PDF generation failed: {str(e)}")
