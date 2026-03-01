"use client";

import { useState, useEffect } from "react";
import { useDashboardStore } from "@/store/dashboard";
import { runMonteCarlo, getScenarios } from "@/lib/api";
import { formatPercent, formatNumber } from "@/lib/utils";
import { MetricCard } from "@/components/ui/MetricCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { MonteCarloChart } from "@/components/charts/MonteCarloChart";
import toast from "react-hot-toast";
import type { Scenario } from "@/types";
import {
  CubeTransparentIcon,
  PlayIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export function MonteCarloTab() {
  const {
    holdings,
    monteCarlo,
    setMonteCarlo,
    isSimulating,
    setIsSimulating,
  } = useDashboardStore();

  const [scenarios, setScenarios] = useState<Record<string, Scenario>>({});
  const [selectedScenario, setSelectedScenario] = useState<string>("");
  const [numSims, setNumSims] = useState(1000);
  const [horizon, setHorizon] = useState(252);

  useEffect(() => {
    getScenarios()
      .then(setScenarios)
      .catch(() => {});
  }, []);

  const handleSimulate = async () => {
    if (holdings.length === 0) {
      toast.error("Add holdings first");
      return;
    }
    setIsSimulating(true);
    try {
      const result = await runMonteCarlo(
        holdings,
        numSims,
        horizon,
        selectedScenario || undefined
      );
      setMonteCarlo(result);
      toast.success(`Simulation complete: ${result.scenario_label}`);
    } catch (err: any) {
      toast.error(err.message || "Simulation failed");
    } finally {
      setIsSimulating(false);
    }
  };

  const fv = monteCarlo?.final_values;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
          Monte Carlo Simulation
        </h2>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
          Stochastic scenario analysis — &quot;What if?&quot; projections
        </p>
      </div>

      {/* Controls */}
      <div className="glass-card p-5">
        <h3 className="section-title mb-4">Simulation Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Scenario picker */}
          <div>
            <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">
              Scenario
            </label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="input-field"
            >
              <option value="">Base Case (no shock)</option>
              {Object.entries(scenarios).map(([key, sc]) => (
                <option key={key} value={key}>
                  {sc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Simulations */}
          <div>
            <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">
              Simulations
            </label>
            <input
              type="range"
              min={100}
              max={5000}
              step={100}
              value={numSims}
              onChange={(e) => setNumSims(parseInt(e.target.value))}
              className="w-full accent-brand-500"
            />
            <span className="text-xs font-mono text-surface-500 dark:text-surface-400">
              {numSims.toLocaleString()}
            </span>
          </div>

          {/* Time Horizon */}
          <div>
            <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">
              Horizon (trading days)
            </label>
            <input
              type="range"
              min={30}
              max={756}
              step={1}
              value={horizon}
              onChange={(e) => setHorizon(parseInt(e.target.value))}
              className="w-full accent-brand-500"
            />
            <span className="text-xs font-mono text-surface-500 dark:text-surface-400">
              {horizon} days (~{(horizon / 252).toFixed(1)} years)
            </span>
          </div>

          {/* Run button */}
          <div className="flex items-end">
            <button
              onClick={handleSimulate}
              disabled={isSimulating || holdings.length === 0}
              className="btn-primary w-full gap-2"
            >
              {isSimulating ? (
                <LoadingSpinner size="sm" />
              ) : (
                <PlayIcon className="w-4 h-4" />
              )}
              {isSimulating ? "Simulating..." : "Run Simulation"}
            </button>
          </div>
        </div>

        {/* Scenario description */}
        {selectedScenario && scenarios[selectedScenario] && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
            <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <strong>{scenarios[selectedScenario].label}:</strong>{" "}
              {scenarios[selectedScenario].description}
            </p>
          </div>
        )}
      </div>

      {/* Results */}
      {isSimulating ? (
        <div className="glass-card p-12">
          <LoadingSpinner
            size="lg"
            label="Running Monte Carlo simulation..."
            className="py-8"
          />
        </div>
      ) : monteCarlo ? (
        <>
          {/* Chart */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">
                Projection Fan Chart
              </h3>
              <span className="badge-neutral">
                {monteCarlo.scenario_label}
              </span>
            </div>
            <MonteCarloChart result={monteCarlo} />
          </div>

          {/* Terminal stats */}
          {fv && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                label="Median Outcome"
                value={formatPercent(fv.median - 1)}
                subLabel="50th percentile"
                trend={fv.median > 1 ? "up" : "down"}
              />
              <MetricCard
                label="Best Case (P95)"
                value={formatPercent(fv.p95 - 1)}
                subLabel="95th percentile"
                trend="up"
              />
              <MetricCard
                label="Worst Case (P5)"
                value={formatPercent(fv.p5 - 1)}
                subLabel="5th percentile"
                trend={fv.p5 > 1 ? "up" : "down"}
              />
              <MetricCard
                label="Prob of Loss"
                value={formatPercent(fv.prob_loss)}
                subLabel="Ending below starting value"
                trend={fv.prob_loss < 0.3 ? "up" : "down"}
              />
            </div>
          )}
        </>
      ) : (
        <div className="glass-card p-12 flex flex-col items-center justify-center">
          <CubeTransparentIcon className="w-16 h-16 text-surface-300 dark:text-surface-700 mb-4" />
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Configure settings above and run a Monte Carlo simulation
          </p>
        </div>
      )}
    </div>
  );
}
