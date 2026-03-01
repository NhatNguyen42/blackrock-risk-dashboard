"""
Portfolio risk analytics engine.

Calculates: Sharpe, Sortino, VaR, CVaR, Beta, Alpha, Treynor,
Information Ratio, Calmar, max drawdown, correlation matrix,
cumulative returns, and VaR heatmap data.
"""
from __future__ import annotations

from typing import Optional

import numpy as np
import pandas as pd
from scipy import stats as sp_stats


# ── Helpers ──────────────────────────────────────────────────
def _daily_returns(prices: pd.DataFrame) -> pd.DataFrame:
    return prices.pct_change().dropna()


def _portfolio_returns(
    daily_ret: pd.DataFrame, weights: list[float]
) -> pd.Series:
    w = np.array(weights)
    # align columns
    return daily_ret.dot(w)


# ── Core metrics ─────────────────────────────────────────────
def compute_risk_metrics(
    prices: pd.DataFrame,
    weights: list[float],
    benchmark_prices: pd.Series,
    rf_annual: float = 0.05,
) -> dict:
    """Return a dict matching the RiskMetrics schema."""
    dr = _daily_returns(prices)
    port_ret = _portfolio_returns(dr, weights)

    bench_ret = benchmark_prices.pct_change().dropna()
    # Align dates
    common = port_ret.index.intersection(bench_ret.index)
    port_ret = port_ret.loc[common]
    bench_ret = bench_ret.loc[common]

    trading_days = 252
    rf_daily = (1 + rf_annual) ** (1 / trading_days) - 1

    ann_ret = port_ret.mean() * trading_days
    ann_vol = port_ret.std() * np.sqrt(trading_days)

    # Sharpe
    sharpe = (ann_ret - rf_annual) / ann_vol if ann_vol else 0.0

    # Sortino
    downside = port_ret[port_ret < 0].std() * np.sqrt(trading_days)
    sortino = (ann_ret - rf_annual) / downside if downside else 0.0

    # Max Drawdown
    cum = (1 + port_ret).cumprod()
    running_max = cum.cummax()
    drawdown = (cum - running_max) / running_max
    max_dd = drawdown.min()

    # VaR & CVaR (historical)
    var_95 = float(np.percentile(port_ret, 5))
    var_99 = float(np.percentile(port_ret, 1))
    cvar_95 = float(port_ret[port_ret <= var_95].mean()) if len(port_ret[port_ret <= var_95]) > 0 else var_95

    # Beta & Alpha
    cov = np.cov(port_ret, bench_ret)
    beta = cov[0, 1] / cov[1, 1] if cov[1, 1] != 0 else 1.0
    alpha = ann_ret - rf_annual - beta * (bench_ret.mean() * trading_days - rf_annual)

    # Treynor
    treynor = (ann_ret - rf_annual) / beta if beta != 0 else 0.0

    # Information Ratio
    active_ret = port_ret - bench_ret
    tracking_err = active_ret.std() * np.sqrt(trading_days)
    info_ratio = (active_ret.mean() * trading_days) / tracking_err if tracking_err else 0.0

    # Calmar
    calmar = ann_ret / abs(max_dd) if max_dd != 0 else 0.0

    return {
        "sharpe_ratio": round(float(sharpe), 4),
        "sortino_ratio": round(float(sortino), 4),
        "max_drawdown": round(float(max_dd), 4),
        "annualized_return": round(float(ann_ret), 4),
        "annualized_volatility": round(float(ann_vol), 4),
        "var_95": round(float(var_95), 6),
        "var_99": round(float(var_99), 6),
        "cvar_95": round(float(cvar_95), 6),
        "beta": round(float(beta), 4),
        "alpha": round(float(alpha), 4),
        "treynor_ratio": round(float(treynor), 4),
        "information_ratio": round(float(info_ratio), 4),
        "calmar_ratio": round(float(calmar), 4),
    }


# ── Correlation matrix ──────────────────────────────────────
def compute_correlation(prices: pd.DataFrame) -> list[dict]:
    """Return list of {x, y, value} for heatmap rendering."""
    dr = _daily_returns(prices)
    corr = dr.corr()
    entries = []
    for c1 in corr.columns:
        for c2 in corr.columns:
            entries.append({"x": str(c1), "y": str(c2), "value": round(float(corr.loc[c1, c2]), 4)})
    return entries


# ── Cumulative returns ───────────────────────────────────────
def compute_cumulative_returns(
    prices: pd.DataFrame, weights: list[float], benchmark_prices: pd.Series
) -> list[dict]:
    dr = _daily_returns(prices)
    port_ret = _portfolio_returns(dr, weights)
    bench_ret = benchmark_prices.pct_change().dropna()
    common = port_ret.index.intersection(bench_ret.index)
    port_cum = (1 + port_ret.loc[common]).cumprod()
    bench_cum = (1 + bench_ret.loc[common]).cumprod()
    records = []
    for d in common:
        records.append({
            "date": d.strftime("%Y-%m-%d"),
            "portfolio": round(float(port_cum.loc[d]), 4),
            "benchmark": round(float(bench_cum.loc[d]), 4),
        })
    return records


# ── VaR heatmap (by asset × confidence level) ───────────────
def compute_var_heatmap(prices: pd.DataFrame) -> list[dict]:
    """Per-asset VaR at multiple confidence levels."""
    dr = _daily_returns(prices)
    levels = [90, 95, 99]
    entries = []
    for col in dr.columns:
        for lvl in levels:
            val = float(np.percentile(dr[col], 100 - lvl))
            entries.append({
                "asset": str(col),
                "confidence": lvl,
                "var": round(val, 6),
            })
    return entries
