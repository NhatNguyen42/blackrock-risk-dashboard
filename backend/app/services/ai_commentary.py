"""
GenAI Commentary service.

Supports OpenAI, Ollama (local), or a mock provider for demo/dev.
"""
from __future__ import annotations

import os
from typing import Optional

from app.schemas import Holding, RiskMetrics


def _build_prompt(
    holdings: list[Holding],
    risk_metrics: Optional[RiskMetrics],
    context: Optional[str],
) -> str:
    alloc_text = ", ".join(
        [f"{h.ticker} ({h.weight*100:.1f}%)" for h in holdings]
    )
    metrics_text = ""
    if risk_metrics:
        m = risk_metrics
        metrics_text = f"""
Key Risk Metrics:
- Sharpe Ratio: {m.sharpe_ratio}
- Sortino Ratio: {m.sortino_ratio}
- Annualized Return: {m.annualized_return*100:.2f}%
- Annualized Volatility: {m.annualized_volatility*100:.2f}%
- Max Drawdown: {m.max_drawdown*100:.2f}%
- VaR (95%): {m.var_95*100:.4f}%
- Beta: {m.beta}
- Alpha: {m.alpha*100:.2f}%
"""

    ctx = f"\nAdditional context: {context}" if context else ""

    return f"""You are an elite portfolio risk analyst at BlackRock, providing institutional-grade commentary.
Analyze this portfolio and provide actionable, concise insights.

Portfolio Allocation: {alloc_text}
{metrics_text}
{ctx}

Provide your analysis in this structure:
1. **Executive Summary** (2-3 sentences on overall positioning)
2. **Key Strengths** (bullet points)
3. **Risk Alerts** (bullet points — what could go wrong)
4. **Actionable Recommendations** (specific rebalancing or hedging ideas)

Be specific about sector tilts, factor exposures, and macro themes relevant to 2025-2026.
Use precise numbers from the metrics provided."""


async def generate_commentary(
    holdings: list[Holding],
    risk_metrics: Optional[RiskMetrics] = None,
    context: Optional[str] = None,
) -> dict:
    """Generate AI commentary. Falls back to mock if no AI provider configured."""
    provider = os.getenv("AI_PROVIDER", "mock").lower()
    prompt = _build_prompt(holdings, risk_metrics, context)

    if provider == "openai":
        return await _openai_commentary(prompt)
    elif provider == "ollama":
        return await _ollama_commentary(prompt)
    else:
        return _mock_commentary(holdings, risk_metrics)


async def _openai_commentary(prompt: str) -> dict:
    """Use OpenAI API via langchain."""
    try:
        from langchain_openai import ChatOpenAI
        from langchain.schema import HumanMessage

        llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.3,
            api_key=os.getenv("OPENAI_API_KEY"),
        )
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        text = response.content
        return _parse_commentary(text)
    except Exception as e:
        return {
            "commentary": f"OpenAI unavailable: {str(e)}. Falling back to mock.",
            **_mock_commentary_data(),
        }


async def _ollama_commentary(prompt: str) -> dict:
    """Use local Ollama instance."""
    try:
        from langchain_community.chat_models import ChatOllama
        from langchain.schema import HumanMessage

        llm = ChatOllama(
            model="llama3.1",
            base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
            temperature=0.3,
        )
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        text = response.content
        return _parse_commentary(text)
    except Exception as e:
        return {
            "commentary": f"Ollama unavailable: {str(e)}. Falling back to mock.",
            **_mock_commentary_data(),
        }


def _parse_commentary(text: str) -> dict:
    """Extract highlights and risk alerts from structured LLM response."""
    highlights = []
    risk_alerts = []
    lines = text.split("\n")
    section = None
    for line in lines:
        stripped = line.strip()
        if "strength" in stripped.lower() or "key strength" in stripped.lower():
            section = "highlights"
            continue
        elif "risk alert" in stripped.lower() or "risk" in stripped.lower() and "alert" in stripped.lower():
            section = "risks"
            continue
        elif "recommendation" in stripped.lower() or "executive" in stripped.lower():
            section = None
            continue

        if stripped.startswith(("-", "•", "*")) and len(stripped) > 3:
            clean = stripped.lstrip("-•* ").strip()
            if section == "highlights":
                highlights.append(clean)
            elif section == "risks":
                risk_alerts.append(clean)

    return {
        "commentary": text,
        "highlights": highlights[:5],
        "risk_alerts": risk_alerts[:5],
    }


def _mock_commentary(
    holdings: list[Holding],
    risk_metrics: Optional[RiskMetrics],
) -> dict:
    """Rich mock commentary for demo/development."""
    tickers = [h.ticker for h in holdings]
    weights = {h.ticker: h.weight for h in holdings}

    # Sector analysis
    tech_tickers = {"AAPL", "MSFT", "NVDA", "GOOGL", "GOOG", "META", "AMZN", "TSM", "AVGO", "AMD"}
    tech_weight = sum(w for t, w in weights.items() if t.upper() in tech_tickers)

    commentary_parts = []
    highlights = []
    risk_alerts = []

    # Executive Summary
    commentary_parts.append("## Executive Summary\n")
    if tech_weight > 0.3:
        commentary_parts.append(
            f"Your portfolio has a **{tech_weight*100:.0f}% technology tilt**, "
            "well-positioned for the 2025-2026 AI infrastructure buildout theme. "
            "However, this concentration introduces meaningful sector risk, particularly "
            "around energy costs and potential regulatory headwinds.\n"
        )
    else:
        commentary_parts.append(
            "Your portfolio shows **diversified sector exposure** with no single-sector dominance. "
            "This balanced positioning should provide resilience across multiple macro scenarios.\n"
        )

    # Metrics-based insights
    if risk_metrics:
        m = risk_metrics
        commentary_parts.append("## Key Strengths\n")
        if m.sharpe_ratio > 1.0:
            s = f"Strong risk-adjusted returns with Sharpe ratio of {m.sharpe_ratio:.2f}"
            highlights.append(s)
            commentary_parts.append(f"- {s}\n")
        if m.alpha > 0:
            s = f"Positive alpha of {m.alpha*100:.2f}% indicates value-add over benchmark"
            highlights.append(s)
            commentary_parts.append(f"- {s}\n")
        if abs(m.max_drawdown) < 0.15:
            s = f"Contained drawdown profile (max DD: {m.max_drawdown*100:.1f}%)"
            highlights.append(s)
            commentary_parts.append(f"- {s}\n")
        if m.sortino_ratio > 1.5:
            s = f"Excellent downside protection (Sortino: {m.sortino_ratio:.2f})"
            highlights.append(s)
            commentary_parts.append(f"- {s}\n")

        commentary_parts.append("\n## Risk Alerts\n")
        if m.annualized_volatility > 0.20:
            r = f"Elevated portfolio volatility at {m.annualized_volatility*100:.1f}% annualized — consider adding low-vol or fixed income positions"
            risk_alerts.append(r)
            commentary_parts.append(f"- ⚠️ {r}\n")
        if m.beta > 1.2:
            r = f"High market sensitivity (Beta: {m.beta:.2f}) — portfolio will amplify drawdowns in a correction"
            risk_alerts.append(r)
            commentary_parts.append(f"- ⚠️ {r}\n")
        if abs(m.var_95) > 0.02:
            r = f"Daily VaR (95%) of {abs(m.var_95)*100:.2f}% implies potential 1-day loss exceeding this threshold 5% of the time"
            risk_alerts.append(r)
            commentary_parts.append(f"- ⚠️ {r}\n")
        if abs(m.max_drawdown) > 0.20:
            r = f"Significant historical drawdown of {m.max_drawdown*100:.1f}% — stress-test against 2022-style rate shock"
            risk_alerts.append(r)
            commentary_parts.append(f"- ⚠️ {r}\n")

    # Recommendations
    commentary_parts.append("\n## Actionable Recommendations\n")
    if tech_weight > 0.35:
        commentary_parts.append(
            "- **Trim tech to ~25-30%**: Rotate 5-10% into healthcare (XLV) or utilities (XLU) for defensive ballast\n"
        )
    commentary_parts.append(
        "- **Add inflation hedge**: Consider 3-5% allocation to TIPS (TIP) or commodities (DJP)\n"
        "- **Tail risk protection**: Evaluate purchasing SPY put spreads for Q3 2026 earnings season\n"
        "- **Rebalance quarterly**: Maintain target allocations to avoid drift-induced concentration\n"
    )

    if not highlights:
        highlights = ["Diversified portfolio construction", "Multiple asset class exposure"]
    if not risk_alerts:
        risk_alerts = ["Monitor macro conditions for potential volatility spikes"]

    return {
        "commentary": "\n".join(commentary_parts),
        "highlights": highlights[:5],
        "risk_alerts": risk_alerts[:5],
    }


def _mock_commentary_data() -> dict:
    return {
        "highlights": ["AI provider unavailable — using cached analysis"],
        "risk_alerts": ["Live commentary temporarily unavailable"],
    }
