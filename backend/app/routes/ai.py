"""AI commentary routes."""
from fastapi import APIRouter, HTTPException

from app.schemas import CommentaryRequest, CommentaryResponse
from app.services.ai_commentary import generate_commentary

router = APIRouter()


@router.post("/commentary", response_model=CommentaryResponse)
async def get_commentary(req: CommentaryRequest):
    """Generate AI commentary for the portfolio."""
    try:
        result = await generate_commentary(
            holdings=req.holdings,
            risk_metrics=req.risk_metrics,
            context=req.context,
        )
        return CommentaryResponse(**result)
    except Exception as e:
        raise HTTPException(500, f"Commentary generation failed: {str(e)}")
