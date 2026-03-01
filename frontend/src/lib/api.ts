/* ── API client for the FastAPI backend ────────────────────── */

import type {
  Holding,
  PortfolioAnalysis,
  MonteCarloResult,
  Commentary,
  RiskMetrics,
  Scenario,
  TickerInfo,
} from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json();
}

/* ── Portfolio ─────────────────────────────────────────────── */
export async function analyzePortfolio(
  holdings: Holding[],
  benchmark = "SPY",
  startDate?: string,
  endDate?: string
): Promise<PortfolioAnalysis> {
  return api<PortfolioAnalysis>("/api/portfolio/analyze", {
    method: "POST",
    body: JSON.stringify({
      holdings,
      benchmark,
      start_date: startDate,
      end_date: endDate,
    }),
  });
}

export async function runMonteCarlo(
  holdings: Holding[],
  numSimulations = 1000,
  timeHorizonDays = 252,
  scenario?: string
): Promise<MonteCarloResult> {
  return api<MonteCarloResult>("/api/portfolio/monte-carlo", {
    method: "POST",
    body: JSON.stringify({
      holdings,
      num_simulations: numSimulations,
      time_horizon_days: timeHorizonDays,
      scenario: scenario || null,
    }),
  });
}

export async function getScenarios(): Promise<Record<string, Scenario>> {
  return api<Record<string, Scenario>>("/api/portfolio/scenarios");
}

/* ── AI ────────────────────────────────────────────────────── */
export async function getCommentary(
  holdings: Holding[],
  riskMetrics?: RiskMetrics,
  context?: string
): Promise<Commentary> {
  return api<Commentary>("/api/ai/commentary", {
    method: "POST",
    body: JSON.stringify({
      holdings,
      risk_metrics: riskMetrics || null,
      context: context || null,
    }),
  });
}

/* ── Market ────────────────────────────────────────────────── */
export async function searchTicker(query: string): Promise<TickerInfo[]> {
  return api<TickerInfo[]>(`/api/market/search/${encodeURIComponent(query)}`);
}

export async function getTickerInfo(symbol: string): Promise<TickerInfo> {
  return api<TickerInfo>(`/api/market/ticker/${encodeURIComponent(symbol)}`);
}

/* ── Reports ───────────────────────────────────────────────── */
export async function downloadPdfReport(
  holdings: Holding[],
  riskMetrics?: RiskMetrics,
  commentary?: string,
  monteCarloStats?: Record<string, unknown>
): Promise<Blob> {
  const res = await fetch(`${BASE}/api/reports/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      holdings,
      risk_metrics: riskMetrics || null,
      commentary: commentary || null,
      monte_carlo_stats: monteCarloStats || null,
    }),
  });
  if (!res.ok) throw new Error("PDF generation failed");
  return res.blob();
}
