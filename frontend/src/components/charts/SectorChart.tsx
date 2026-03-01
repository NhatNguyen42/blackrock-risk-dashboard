"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { SECTOR_COLORS } from "@/lib/utils";
import type { SectorExposure } from "@/types";

interface SectorChartProps {
  data: SectorExposure[];
}

export function SectorChart({ data }: SectorChartProps) {
  const chartData = data
    .map((d) => ({
      sector: d.sector,
      weight: Math.round(d.weight * 10000) / 100,
    }))
    .sort((a, b) => b.weight - a.weight);

  return (
    <div className="glass-card p-5">
      <h3 className="section-title mb-4">Sector Exposure</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" barSize={18}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-surface-200 dark:text-surface-700"
              opacity={0.5}
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `${v}%`}
              stroke="currentColor"
              className="text-surface-400"
            />
            <YAxis
              type="category"
              dataKey="sector"
              tick={{ fontSize: 10 }}
              width={120}
              stroke="currentColor"
              className="text-surface-400"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="glass-card !rounded-lg p-2.5 !shadow-xl text-xs">
                    <p className="font-semibold text-surface-900 dark:text-white">
                      {d.sector}
                    </p>
                    <p className="text-surface-500 dark:text-surface-400">
                      {d.weight}%
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="weight" radius={[0, 6, 6, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`sector-${index}`}
                  fill={SECTOR_COLORS[entry.sector] || "#94a3b8"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
