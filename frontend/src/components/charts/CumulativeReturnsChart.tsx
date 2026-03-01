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
import type { CumulativeReturn } from "@/types";

interface CumulativeReturnsChartProps {
  data: CumulativeReturn[];
}

export function CumulativeReturnsChart({ data }: CumulativeReturnsChartProps) {
  // Thin data if too many points
  const thinned =
    data.length > 200
      ? data.filter((_, i) => i % Math.ceil(data.length / 200) === 0 || i === data.length - 1)
      : data;

  return (
    <div className="glass-card p-5">
      <h3 className="section-title mb-4">Cumulative Returns</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={thinned}>
            <defs>
              <linearGradient id="gradPort" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2aa3ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2aa3ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradBench" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-surface-200 dark:text-surface-700"
              opacity={0.5}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => v?.slice(0, 7)}
              stroke="currentColor"
              className="text-surface-400"
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
                      {label}
                    </p>
                    {payload.map((p) => (
                      <p
                        key={p.dataKey as string}
                        style={{ color: p.color }}
                        className="font-semibold"
                      >
                        {p.dataKey === "portfolio" ? "Portfolio" : "Benchmark"}:{" "}
                        {(((p.value as number) - 1) * 100).toFixed(2)}%
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="portfolio"
              stroke="#2aa3ff"
              strokeWidth={2}
              fill="url(#gradPort)"
              name="Portfolio"
            />
            <Area
              type="monotone"
              dataKey="benchmark"
              stroke="#94a3b8"
              strokeWidth={1.5}
              fill="url(#gradBench)"
              name="Benchmark"
              strokeDasharray="4 2"
            />
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
    </div>
  );
}
