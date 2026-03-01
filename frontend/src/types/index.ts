/* ── Types for the BlackRock Risk Dashboard ────────────────── */

export interface Holding {
  ticker: string;
  weight: number;
  shares?: number;
  name?: string;
}

export interface RiskMetrics {
  sharpe_ratio: number;
  sortino_ratio: number;
  max_drawdown: number;
  annualized_return: number;
  annualized_volatility: number;
  var_95: number;
  var_99: number;
  cvar_95: number;
  beta: number;
  alpha: number;
  treynor_ratio: number;
  information_ratio: number;
  calmar_ratio: number;
}

export interface CorrelationEntry {
  x: string;
  y: string;
  value: number;
}

export interface CumulativeReturn {
  date: string;
  portfolio: number;
  benchmark: number;
}

export interface VarHeatmapEntry {
  asset: string;
  confidence: number;
  var: number;
}

export interface AllocationEntry {
  ticker: string;
  weight: number;
  name: string;
}

export interface SectorExposure {
  sector: string;
  weight: number;
}

export interface PortfolioAnalysis {
  risk_metrics: RiskMetrics;
  correlation_matrix: CorrelationEntry[];
  cumulative_returns: CumulativeReturn[];
  var_heatmap: VarHeatmapEntry[];
  allocation: AllocationEntry[];
  sector_exposure: SectorExposure[];
}

export interface MonteCarloResult {
  percentiles: Record<string, number[]>;
  final_values: {
    mean: number;
    median: number;
    std: number;
    p5: number;
    p25: number;
    p75: number;
    p95: number;
    prob_loss: number;
  };
  scenario_label: string;
}

export interface Scenario {
  label: string;
  description: string;
}

export interface Commentary {
  commentary: string;
  highlights: string[];
  risk_alerts: string[];
}

export interface TickerInfo {
  ticker: string;
  name: string;
  sector?: string;
  market_cap?: number;
  price?: number;
}
