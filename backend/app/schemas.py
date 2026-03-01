"""Pydantic schemas for request / response models."""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


# ── Portfolio ───────────────────────────────────────────────
class Holding(BaseModel):
    ticker: str = Field(..., examples=["AAPL"])
    weight: float = Field(..., ge=0, le=1, examples=[0.25])
    shares: Optional[float] = None
    name: Optional[str] = None


class PortfolioRequest(BaseModel):
    holdings: list[Holding]
    benchmark: str = Field(default="SPY", examples=["SPY"])
    start_date: Optional[str] = Field(default=None, examples=["2024-01-01"])
    end_date: Optional[str] = Field(default=None, examples=["2026-02-28"])


class RiskMetrics(BaseModel):
    sharpe_ratio: float
    sortino_ratio: float
    max_drawdown: float
    annualized_return: float
    annualized_volatility: float
    var_95: float
    var_99: float
    cvar_95: float
    beta: float
    alpha: float
    treynor_ratio: float
    information_ratio: float
    calmar_ratio: float


class CorrelationEntry(BaseModel):
    x: str
    y: str
    value: float


class PortfolioAnalysis(BaseModel):
    risk_metrics: RiskMetrics
    correlation_matrix: list[CorrelationEntry]
    cumulative_returns: list[dict]
    var_heatmap: list[dict]
    allocation: list[dict]
    sector_exposure: list[dict]


# ── Monte Carlo ─────────────────────────────────────────────
class MonteCarloRequest(BaseModel):
    holdings: list[Holding]
    num_simulations: int = Field(default=1000, ge=100, le=10000)
    time_horizon_days: int = Field(default=252, ge=30, le=1260)
    scenario: Optional[str] = Field(
        default=None,
        examples=["ai_capex_slowdown"],
        description="Named scenario to apply shock factors",
    )


class MonteCarloResult(BaseModel):
    percentiles: dict  # {5: [...], 25: [...], 50: [...], 75: [...], 95: [...]}
    final_values: dict  # stats at terminal date
    scenario_label: str


# ── AI Commentary ───────────────────────────────────────────
class CommentaryRequest(BaseModel):
    holdings: list[Holding]
    risk_metrics: Optional[RiskMetrics] = None
    context: Optional[str] = None


class CommentaryResponse(BaseModel):
    commentary: str
    highlights: list[str] = []
    risk_alerts: list[str] = []


# ── Market ──────────────────────────────────────────────────
class TickerSearch(BaseModel):
    query: str = Field(..., min_length=1, max_length=10)


class TickerInfo(BaseModel):
    ticker: str
    name: str
    sector: Optional[str] = None
    market_cap: Optional[float] = None
    price: Optional[float] = None
