"""Portfolio analysis routes."""
from fastapi import APIRouter, HTTPException

from app.schemas import (
    PortfolioRequest,
    PortfolioAnalysis,
    MonteCarloRequest,
    MonteCarloResult,
)
from app.services.market_data import fetch_prices, get_sector_exposure
from app.services.risk_engine import (
    compute_risk_metrics,
    compute_correlation,
    compute_cumulative_returns,
    compute_var_heatmap,
)
from app.services.monte_carlo import run_monte_carlo, SCENARIOS

router = APIRouter()


@router.post("/analyze", response_model=PortfolioAnalysis)
async def analyze_portfolio(req: PortfolioRequest):
    """Full portfolio risk analysis."""
    try:
        tickers = [h.ticker.upper() for h in req.holdings]
        weights = [h.weight for h in req.holdings]

        # Normalize weights
        total_w = sum(weights)
        if abs(total_w - 1.0) > 0.01:
            weights = [w / total_w for w in weights]

        # Fetch data
        all_tickers = list(set(tickers + [req.benchmark]))
        prices = fetch_prices(all_tickers, req.start_date, req.end_date)

        if prices.empty or len(prices) < 30:
            raise HTTPException(400, "Insufficient price data. Check tickers and date range.")

        # Separate benchmark
        bench_col = req.benchmark
        if bench_col not in prices.columns:
            raise HTTPException(400, f"Benchmark {bench_col} not found in data")

        bench_prices = prices[bench_col]
        asset_prices = prices[[t for t in tickers if t in prices.columns]]

        # Align weights to available tickers
        available = [t for t in tickers if t in asset_prices.columns]
        avail_weights = [weights[tickers.index(t)] for t in available]
        total_aw = sum(avail_weights)
        avail_weights = [w / total_aw for w in avail_weights]

        # Compute everything
        risk_metrics = compute_risk_metrics(asset_prices, avail_weights, bench_prices)
        correlation = compute_correlation(asset_prices)
        cum_returns = compute_cumulative_returns(asset_prices, avail_weights, bench_prices)
        var_heatmap = compute_var_heatmap(asset_prices)

        allocation = [
            {"ticker": t, "weight": round(w, 4), "name": t}
            for t, w in zip(available, avail_weights)
        ]

        try:
            sector_exposure = get_sector_exposure(available, avail_weights)
        except Exception:
            sector_exposure = [{"sector": "Unknown", "weight": 1.0}]

        return PortfolioAnalysis(
            risk_metrics=risk_metrics,
            correlation_matrix=correlation,
            cumulative_returns=cum_returns,
            var_heatmap=var_heatmap,
            allocation=allocation,
            sector_exposure=sector_exposure,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Analysis failed: {str(e)}")


@router.post("/monte-carlo", response_model=MonteCarloResult)
async def monte_carlo_simulation(req: MonteCarloRequest):
    """Run Monte Carlo simulation with optional scenario."""
    try:
        tickers = [h.ticker.upper() for h in req.holdings]
        weights = [h.weight for h in req.holdings]

        total_w = sum(weights)
        weights = [w / total_w for w in weights]

        prices = fetch_prices(tickers)

        if prices.empty:
            raise HTTPException(400, "Could not fetch price data")

        available = [t for t in tickers if t in prices.columns]
        avail_weights = [weights[tickers.index(t)] for t in available]
        total_aw = sum(avail_weights)
        avail_weights = [w / total_aw for w in avail_weights]

        result = run_monte_carlo(
            prices[available],
            avail_weights,
            num_simulations=req.num_simulations,
            time_horizon_days=req.time_horizon_days,
            scenario=req.scenario,
        )

        return MonteCarloResult(**result)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Monte Carlo failed: {str(e)}")


@router.get("/scenarios")
async def list_scenarios():
    """List available scenario definitions."""
    return {
        k: {"label": v["label"], "description": v["description"]}
        for k, v in SCENARIOS.items()
    }
