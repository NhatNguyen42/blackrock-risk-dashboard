"use client";

import { useDashboardStore } from "@/store/dashboard";
import { analyzePortfolio } from "@/lib/api";
import { formatPercent, formatNumber } from "@/lib/utils";
import { MetricCard } from "@/components/ui/MetricCard";
import { LoadingSpinner, SkeletonCard } from "@/components/ui/LoadingSpinner";
import { PortfolioInput } from "@/components/PortfolioInput";
import { AllocationPieChart } from "@/components/charts/AllocationPieChart";
import { CumulativeReturnsChart } from "@/components/charts/CumulativeReturnsChart";
import { SectorChart } from "@/components/charts/SectorChart";
import toast from "react-hot-toast";
import {
  ChartBarIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export function OverviewTab() {
  const {
    holdings,
    benchmark,
    analysis,
    setAnalysis,
    isAnalyzing,
    setIsAnalyzing,
  } = useDashboardStore();

  const handleAnalyze = async () => {
    if (holdings.length === 0) {
      toast.error("Add at least one holding");
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzePortfolio(holdings, benchmark);
      setAnalysis(result);
      toast.success("Portfolio analysis complete!");
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const m = analysis?.risk_metrics;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
            Portfolio Overview
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
            Configure your portfolio and run risk analysis
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || holdings.length === 0}
          className="btn-primary gap-2"
        >
          {isAnalyzing ? (
            <LoadingSpinner size="sm" />
          ) : (
            <BoltIcon className="w-4 h-4" />
          )}
          {isAnalyzing ? "Analyzing..." : "Run Analysis"}
        </button>
      </div>

      {/* Top row: Portfolio Input + Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioInput />
        {analysis ? (
          <AllocationPieChart data={analysis.allocation} />
        ) : (
          <div className="glass-card p-5 flex items-center justify-center">
            <p className="text-sm text-surface-400 dark:text-surface-500">
              Run analysis to see allocation chart
            </p>
          </div>
        )}
      </div>

      {/* Key Metrics Cards */}
      {isAnalyzing ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : m ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Annualized Return"
            value={formatPercent(m.annualized_return)}
            trend={m.annualized_return > 0 ? "up" : "down"}
            icon={<ArrowTrendingUpIcon className="w-4 h-4" />}
          />
          <MetricCard
            label="Sharpe Ratio"
            value={formatNumber(m.sharpe_ratio)}
            subLabel={m.sharpe_ratio > 1 ? "Good risk-adjusted" : "Below average"}
            trend={m.sharpe_ratio > 1 ? "up" : "neutral"}
            icon={<ChartBarIcon className="w-4 h-4" />}
          />
          <MetricCard
            label="Max Drawdown"
            value={formatPercent(m.max_drawdown)}
            trend={m.max_drawdown > -0.15 ? "up" : "down"}
            icon={<ShieldCheckIcon className="w-4 h-4" />}
          />
          <MetricCard
            label="Beta"
            value={formatNumber(m.beta)}
            subLabel={m.beta > 1 ? "High sensitivity" : "Defensive"}
            trend={m.beta <= 1 ? "up" : "down"}
            icon={<BoltIcon className="w-4 h-4" />}
          />
        </div>
      ) : null}

      {/* Charts row */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CumulativeReturnsChart data={analysis.cumulative_returns} />
          <SectorChart data={analysis.sector_exposure} />
        </div>
      )}
    </div>
  );
}
