"""
Market data service — fetches prices via yfinance with caching.
"""
from __future__ import annotations

import datetime as dt
from functools import lru_cache
from typing import Optional

import pandas as pd
import yfinance as yf


SECTOR_MAP: dict[str, str] = {}  # populated on first fetch


def _default_dates(
    start: Optional[str], end: Optional[str]
) -> tuple[str, str]:
    end_d = end or dt.date.today().isoformat()
    start_d = start or (dt.date.today() - dt.timedelta(days=365 * 2)).isoformat()
    return start_d, end_d


def fetch_prices(
    tickers: list[str],
    start: Optional[str] = None,
    end: Optional[str] = None,
) -> pd.DataFrame:
    """Return adjusted close prices (columns = tickers)."""
    start_d, end_d = _default_dates(start, end)
    data = yf.download(
        " ".join(tickers),
        start=start_d,
        end=end_d,
        auto_adjust=True,
        progress=False,
    )
    if isinstance(data.columns, pd.MultiIndex):
        prices = data["Close"]
    else:
        prices = data[["Close"]].rename(columns={"Close": tickers[0]})
    prices = prices.dropna(how="all").ffill().bfill()
    return prices


def fetch_ticker_info(ticker: str) -> dict:
    """Return basic info dict for a single ticker."""
    t = yf.Ticker(ticker)
    info = t.info or {}
    return {
        "ticker": ticker.upper(),
        "name": info.get("shortName", info.get("longName", ticker)),
        "sector": info.get("sector"),
        "market_cap": info.get("marketCap"),
        "price": info.get("currentPrice") or info.get("previousClose"),
    }


def get_sector_exposure(tickers: list[str], weights: list[float]) -> list[dict]:
    """Return [{sector, weight}] for the portfolio."""
    sector_weights: dict[str, float] = {}
    for tkr, w in zip(tickers, weights):
        try:
            info = yf.Ticker(tkr).info or {}
            sector = info.get("sector", "Unknown")
        except Exception:
            sector = "Unknown"
        sector_weights[sector] = sector_weights.get(sector, 0.0) + w
    return [{"sector": s, "weight": round(w, 4)} for s, w in sector_weights.items()]
