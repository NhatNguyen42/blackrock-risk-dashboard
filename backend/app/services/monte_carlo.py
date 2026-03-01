"""
Monte Carlo simulation engine.

Supports named scenarios (shock factors applied to drift/vol).
"""
from __future__ import annotations

from typing import Optional

import numpy as np
import pandas as pd


# ── Scenario definitions ─────────────────────────────────────
SCENARIOS: dict[str, dict] = {
    "ai_capex_slowdown": {
        "label": "AI Capex Slowdown",
        "drift_multiplier": 0.6,
        "vol_multiplier": 1.4,
        "description": "Reduced AI infrastructure spending leads to lower growth and higher uncertainty.",
    },
    "rate_hike": {
        "label": "Aggressive Rate Hikes",
        "drift_multiplier": 0.7,
        "vol_multiplier": 1.3,
        "description": "Central banks raise rates sharply to combat inflation.",
    },
    "energy_crisis": {
        "label": "Energy Supply Shock",
        "drift_multiplier": 0.5,
        "vol_multiplier": 1.6,
        "description": "Major energy supply disruption impacts global markets.",
    },
    "bull_run": {
        "label": "Tech Bull Run",
        "drift_multiplier": 1.5,
        "vol_multiplier": 0.8,
        "description": "AI adoption accelerates, driving strong tech-led growth.",
    },
    "recession": {
        "label": "Global Recession",
        "drift_multiplier": -0.5,
        "vol_multiplier": 1.8,
        "description": "Broad economic downturn with elevated market stress.",
    },
}


def run_monte_carlo(
    prices: pd.DataFrame,
    weights: list[float],
    num_simulations: int = 1000,
    time_horizon_days: int = 252,
    scenario: Optional[str] = None,
) -> dict:
    """
    Run Geometric Brownian Motion Monte Carlo on portfolio.
    Returns percentile paths + terminal stats.
    """
    daily_ret = prices.pct_change().dropna()
    w = np.array(weights)
    port_ret = daily_ret.dot(w)

    mu = float(port_ret.mean())
    sigma = float(port_ret.std())

    # Apply scenario shocks
    scenario_label = "Base Case"
    if scenario and scenario in SCENARIOS:
        sc = SCENARIOS[scenario]
        mu *= sc["drift_multiplier"]
        sigma *= sc["vol_multiplier"]
        scenario_label = sc["label"]

    # GBM simulation
    dt_step = 1.0  # daily
    sim = np.zeros((num_simulations, time_horizon_days))
    sim[:, 0] = 1.0  # start at $1 (normalized)

    rng = np.random.default_rng(42)
    for t in range(1, time_horizon_days):
        z = rng.standard_normal(num_simulations)
        sim[:, t] = sim[:, t - 1] * np.exp(
            (mu - 0.5 * sigma**2) * dt_step + sigma * np.sqrt(dt_step) * z
        )

    # Percentile paths
    percentile_keys = [5, 25, 50, 75, 95]
    percentiles = {}
    for p in percentile_keys:
        path = np.percentile(sim, p, axis=0)
        percentiles[str(p)] = [round(float(v), 4) for v in path]

    # Terminal value stats
    final = sim[:, -1]
    final_stats = {
        "mean": round(float(np.mean(final)), 4),
        "median": round(float(np.median(final)), 4),
        "std": round(float(np.std(final)), 4),
        "p5": round(float(np.percentile(final, 5)), 4),
        "p25": round(float(np.percentile(final, 25)), 4),
        "p75": round(float(np.percentile(final, 75)), 4),
        "p95": round(float(np.percentile(final, 95)), 4),
        "prob_loss": round(float(np.mean(final < 1.0)), 4),
    }

    return {
        "percentiles": percentiles,
        "final_values": final_stats,
        "scenario_label": scenario_label,
    }
