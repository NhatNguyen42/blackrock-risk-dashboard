"use client";

import { cn } from "@/lib/utils";
import type { CorrelationEntry } from "@/types";

interface CorrelationMatrixProps {
  data: CorrelationEntry[];
}

export function CorrelationMatrix({ data }: CorrelationMatrixProps) {
  if (!data.length) return null;

  const assets = [...new Set(data.map((d) => d.x))];

  const getValue = (x: string, y: string): number => {
    const entry = data.find((d) => d.x === x && d.y === y);
    return entry?.value ?? 0;
  };

  const getColor = (val: number): string => {
    if (val >= 0.8) return "bg-red-500/80 text-white";
    if (val >= 0.6) return "bg-orange-400/60 text-white";
    if (val >= 0.3) return "bg-amber-300/50 text-surface-900 dark:text-white";
    if (val >= 0) return "bg-emerald-300/40 text-surface-900 dark:text-white";
    if (val >= -0.3) return "bg-sky-300/40 text-surface-900 dark:text-white";
    return "bg-blue-500/60 text-white";
  };

  return (
    <div className="glass-card p-5">
      <h3 className="section-title mb-4">Correlation Matrix</h3>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="text-xs">
          <thead>
            <tr>
              <th className="py-2 px-2" />
              {assets.map((a) => (
                <th
                  key={a}
                  className="py-2 px-2 text-center text-surface-500 dark:text-surface-400 font-medium"
                >
                  {a}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assets.map((row) => (
              <tr key={row}>
                <td className="py-1 px-2 font-semibold text-surface-900 dark:text-surface-100">
                  {row}
                </td>
                {assets.map((col) => {
                  const val = getValue(row, col);
                  return (
                    <td key={col} className="py-1 px-1">
                      <div
                        className={cn(
                          "w-12 h-8 rounded flex items-center justify-center font-mono text-[10px] font-medium",
                          getColor(val)
                        )}
                        title={`${row} / ${col}: ${val.toFixed(3)}`}
                      >
                        {val.toFixed(2)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
