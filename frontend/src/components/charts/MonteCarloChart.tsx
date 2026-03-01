"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { MonteCarloResult } from "@/types";

interface MonteCarloChartProps {
  result: MonteCarloResult;
}

export function MonteCarloChart({ result }: MonteCarloChartProps) {
  const { percentiles } = result;
  const p50 = percentiles["50"] || [];

  // Build chart data from percentile paths
  const chartData = p50.map((_, i) => ({
    day: i + 1,
    p5: percentiles["5"]?.[i] ?? 0,
    p25: percentiles["25"]?.[i] ?? 0,
    p50: percentiles["50"]?.[i] ?? 0,
    p75: percentiles["75"]?.[i] ?? 0,
    p95: percentiles["95"]?.[i] ?? 0,
  }));

  // Thin if needed
  const thinned =
    chartData.length > 250
      ? chartData.filter(
          (_, i) => i % Math.ceil(chartData.length / 250) === 0 || i === chartData.length - 1
        )
      : chartData;

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={thinned}>
          <defs>
            <linearGradient id="mc95" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="mc75" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2aa3ff" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#2aa3ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-surface-200 dark:text-surface-700"
            opacity={0.5}
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10 }}
            stroke="currentColor"
            className="text-surface-400"
            label={{ value: "Trading Days", position: "insideBottom", offset: -5, fontSize: 10 }}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickFormatter={(v) => `${((v - 1) * 100).toFixed(0)}%`}
            stroke="currentColor"
            className="text-surface-400"
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="glass-card !rounded-lg p-3 !shadow-xl text-xs">
                  <p className="font-medium text-surface-500 dark:text-surface-400 mb-1">
                    Day {label}
                  </p>
                  {payload.map((p) => (
                    <p
                      key={p.dataKey as string}
                      className="text-surface-700 dark:text-surface-300"
                    >
                      {p.dataKey}: {(((p.value as number) - 1) * 100).toFixed(1)}%
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Area type="monotone" dataKey="p95" stroke="#10b981" strokeWidth={1} fill="url(#mc95)" name="95th %ile" />
          <Area type="monotone" dataKey="p75" stroke="#2aa3ff" strokeWidth={1} fill="url(#mc75)" name="75th %ile" />
          <Area type="monotone" dataKey="p50" stroke="#f59e0b" strokeWidth={2.5} fill="none" name="Median" />
          <Area type="monotone" dataKey="p25" stroke="#94a3b8" strokeWidth={1} fill="none" name="25th %ile" strokeDasharray="4 2" />
          <Area type="monotone" dataKey="p5" stroke="#ef4444" strokeWidth={1} fill="none" name="5th %ile" strokeDasharray="4 2" />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-surface-600 dark:text-surface-400">
                {value}
              </span>
            )}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
