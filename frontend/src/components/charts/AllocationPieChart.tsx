"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { CHART_COLORS } from "@/lib/utils";
import type { AllocationEntry } from "@/types";

interface AllocationPieChartProps {
  data: AllocationEntry[];
}

export function AllocationPieChart({ data }: AllocationPieChartProps) {
  const chartData = data.map((d) => ({
    name: d.ticker,
    value: Math.round(d.weight * 10000) / 100,
  }));

  return (
    <div className="glass-card p-5">
      <h3 className="section-title mb-4">Portfolio Allocation</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0];
                return (
                  <div className="glass-card !rounded-lg p-2.5 !shadow-xl text-xs">
                    <p className="font-semibold text-surface-900 dark:text-white">
                      {d.name}
                    </p>
                    <p className="text-surface-500 dark:text-surface-400">
                      {d.value}%
                    </p>
                  </div>
                );
              }}
            />
            <Legend
              formatter={(value) => (
                <span className="text-xs text-surface-600 dark:text-surface-400">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
