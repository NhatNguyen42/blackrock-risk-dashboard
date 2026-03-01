"use client";

import { cn } from "@/lib/utils";
import type { VarHeatmapEntry } from "@/types";

interface VarHeatmapProps {
  data: VarHeatmapEntry[];
}

export function VarHeatmap({ data }: VarHeatmapProps) {
  if (!data.length) return null;

  const assets = [...new Set(data.map((d) => d.asset))];
  const levels = [...new Set(data.map((d) => d.confidence))].sort();

  const getColor = (val: number): string => {
    const absVal = Math.abs(val);
    if (absVal > 0.03) return "bg-red-500/80 text-white";
    if (absVal > 0.02) return "bg-orange-500/70 text-white";
    if (absVal > 0.015) return "bg-amber-500/60 text-white";
    if (absVal > 0.01) return "bg-yellow-400/50 text-surface-900 dark:text-white";
    return "bg-emerald-400/40 text-surface-900 dark:text-white";
  };

  const getValue = (asset: string, conf: number): number => {
    const entry = data.find((d) => d.asset === asset && d.confidence === conf);
    return entry?.var ?? 0;
  };

  return (
    <div className="glass-card p-5">
      <h3 className="section-title mb-4">Value at Risk Heatmap</h3>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left py-2 px-3 text-surface-500 dark:text-surface-400 font-medium">
                Asset
              </th>
              {levels.map((lvl) => (
                <th
                  key={lvl}
                  className="text-center py-2 px-3 text-surface-500 dark:text-surface-400 font-medium"
                >
                  {lvl}% VaR
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset}>
                <td className="py-1.5 px-3 font-semibold text-surface-900 dark:text-surface-100">
                  {asset}
                </td>
                {levels.map((lvl) => {
                  const val = getValue(asset, lvl);
                  return (
                    <td key={lvl} className="py-1.5 px-2">
                      <div
                        className={cn(
                          "rounded-lg py-1.5 px-2 text-center font-mono font-medium",
                          getColor(val)
                        )}
                      >
                        {(val * 100).toFixed(2)}%
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 text-[10px] text-surface-500 dark:text-surface-400">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-emerald-400/40" /> Low Risk
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-400/50" /> Moderate
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-500/70" /> Elevated
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500/80" /> High Risk
        </span>
      </div>
    </div>
  );
}
