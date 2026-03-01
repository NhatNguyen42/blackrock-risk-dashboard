"use client";

import { useDashboardStore } from "@/store/dashboard";
import { formatPercent, formatNumber } from "@/lib/utils";
import { MetricCard } from "@/components/ui/MetricCard";
import { VarHeatmap } from "@/components/charts/VarHeatmap";
import { CorrelationMatrix } from "@/components/charts/CorrelationMatrix";
import {
  ShieldExclamationIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
  FireIcon,
  ChartBarSquareIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

export function RiskTab() {
  const { analysis } = useDashboardStore();
  const m = analysis?.risk_metrics;

  if (!analysis || !m) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <ShieldExclamationIcon className="w-16 h-16 text-surface-300 dark:text-surface-700 mb-4" />
        <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300">
          No Analysis Data
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          Go to Overview and run a portfolio analysis first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
          Risk Analysis
        </h2>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
          Detailed risk metrics, VaR heatmap, and correlations
        </p>
      </div>

      {/* Full metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Sharpe Ratio"
          value={formatNumber(m.sharpe_ratio)}
          subLabel="Risk-adjusted return"
          trend={m.sharpe_ratio > 1 ? "up" : "neutral"}
          icon={<ChartBarSquareIcon className="w-4 h-4" />}
        />
        <MetricCard
          label="Sortino Ratio"
          value={formatNumber(m.sortino_ratio)}
          subLabel="Downside-adjusted return"
          trend={m.sortino_ratio > 1.5 ? "up" : "neutral"}
          icon={<AdjustmentsHorizontalIcon className="w-4 h-4" />}
        />
        <MetricCard
          label="Annualized Return"
          value={formatPercent(m.annualized_return)}
          trend={m.annualized_return > 0 ? "up" : "down"}
        />
        <MetricCard
          label="Annualized Vol"
          value={formatPercent(m.annualized_volatility)}
          subLabel={m.annualized_volatility > 0.2 ? "High" : "Moderate"}
          trend={m.annualized_volatility <= 0.2 ? "up" : "down"}
          icon={<FireIcon className="w-4 h-4" />}
        />
        <MetricCard
          label="Max Drawdown"
          value={formatPercent(m.max_drawdown)}
          trend={m.max_drawdown > -0.15 ? "up" : "down"}
          icon={<ArrowTrendingDownIcon className="w-4 h-4" />}
        />
        <MetricCard
          label="VaR (95%)"
          value={formatPercent(m.var_95, 4)}
          subLabel="1-day worst loss"
          icon={<ShieldExclamationIcon className="w-4 h-4" />}
        />
        <MetricCard
          label="VaR (99%)"
          value={formatPercent(m.var_99, 4)}
          subLabel="Extreme tail risk"
        />
        <MetricCard
          label="CVaR (95%)"
          value={formatPercent(m.cvar_95, 4)}
          subLabel="Expected shortfall"
        />
        <MetricCard
          label="Beta"
          value={formatNumber(m.beta)}
          subLabel={m.beta > 1 ? "Aggressive" : "Defensive"}
          trend={m.beta <= 1 ? "up" : "down"}
          icon={<ScaleIcon className="w-4 h-4" />}
        />
        <MetricCard
          label="Alpha"
          value={formatPercent(m.alpha)}
          subLabel="Excess return"
          trend={m.alpha > 0 ? "up" : "down"}
        />
        <MetricCard
          label="Treynor Ratio"
          value={formatNumber(m.treynor_ratio)}
          subLabel="Return per unit beta"
        />
        <MetricCard
          label="Info Ratio"
          value={formatNumber(m.information_ratio)}
          subLabel="Active return / tracking error"
        />
        <MetricCard
          label="Calmar Ratio"
          value={formatNumber(m.calmar_ratio)}
          subLabel="Return / max drawdown"
        />
      </div>

      {/* Heatmap & Correlation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VarHeatmap data={analysis.var_heatmap} />
        <CorrelationMatrix data={analysis.correlation_matrix} />
      </div>
    </div>
  );
}
