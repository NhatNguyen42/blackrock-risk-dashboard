"""Market data routes."""
from fastapi import APIRouter, HTTPException

from app.schemas import TickerInfo
from app.services.market_data import fetch_ticker_info

router = APIRouter()


@router.get("/ticker/{symbol}", response_model=TickerInfo)
async def get_ticker(symbol: str):
    """Look up ticker info."""
    try:
        info = fetch_ticker_info(symbol.upper())
        return TickerInfo(**info)
    except Exception as e:
        raise HTTPException(404, f"Ticker not found: {str(e)}")


@router.get("/search/{query}")
async def search_tickers(query: str):
    """Simple ticker search (lookup single symbol)."""
    try:
        info = fetch_ticker_info(query.upper())
        return [TickerInfo(**info)]
    except Exception:
        return []
