"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useDashboardStore } from "@/store/dashboard";
import { cn } from "@/lib/utils";
import {
  PlusIcon,
  TrashIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import Papa from "papaparse";
import type { Holding } from "@/types";

export function PortfolioInput() {
  const { holdings, setHoldings, addHolding, removeHolding, updateHolding } =
    useDashboardStore();
  const [newTicker, setNewTicker] = useState("");
  const [newWeight, setNewWeight] = useState("");

  // CSV drag-and-drop
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsed: Holding[] = [];
          for (const row of results.data as Record<string, string>[]) {
            const ticker =
              row.ticker || row.Ticker || row.symbol || row.Symbol || "";
            const weight = parseFloat(
              row.weight || row.Weight || row.allocation || row.Allocation || "0"
            );
            const name = row.name || row.Name || ticker;
            if (ticker && weight > 0) {
              parsed.push({
                ticker: ticker.toUpperCase().trim(),
                weight: weight > 1 ? weight / 100 : weight,
                name: name.trim(),
              });
            }
          }
          if (parsed.length > 0) {
            setHoldings(parsed);
          }
        },
      });
    },
    [setHoldings]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  const handleAddHolding = () => {
    if (!newTicker.trim()) return;
    const w = parseFloat(newWeight) || 0.1;
    addHolding({
      ticker: newTicker.toUpperCase().trim(),
      weight: w > 1 ? w / 100 : w,
      name: newTicker.toUpperCase().trim(),
    });
    setNewTicker("");
    setNewWeight("");
  };

  const totalWeight = holdings.reduce((s, h) => s + h.weight, 0);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">Portfolio Holdings</h3>
        <span
          className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            Math.abs(totalWeight - 1) < 0.01
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          )}
        >
          Total: {(totalWeight * 100).toFixed(1)}%
        </span>
      </div>

      {/* CSV Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-4 mb-4 text-center cursor-pointer transition-all duration-200",
          isDragActive
            ? "border-brand-500 bg-brand-50/50 dark:bg-brand-500/5"
            : "border-surface-200 dark:border-surface-700 hover:border-brand-400 hover:bg-surface-50 dark:hover:bg-surface-800/50"
        )}
      >
        <input {...getInputProps()} />
        <ArrowUpTrayIcon className="w-6 h-6 mx-auto mb-1 text-surface-400" />
        <p className="text-xs text-surface-500 dark:text-surface-400">
          {isDragActive
            ? "Drop CSV here..."
            : "Drag & drop CSV (ticker, weight) or click to upload"}
        </p>
      </div>

      {/* Manual add */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddHolding()}
          placeholder="Ticker (e.g. AAPL)"
          className="input-field flex-1"
        />
        <input
          type="number"
          value={newWeight}
          onChange={(e) => setNewWeight(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddHolding()}
          placeholder="Weight %"
          className="input-field w-24"
          min="0"
          max="100"
          step="1"
        />
        <button onClick={handleAddHolding} className="btn-primary !px-3">
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Holdings list */}
      <div className="space-y-1.5 max-h-80 overflow-y-auto custom-scrollbar">
        {holdings.map((h) => (
          <div
            key={h.ticker}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-50 dark:bg-surface-800/50 group hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-500/10 flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-400 flex-shrink-0">
              {h.ticker.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">
                {h.ticker}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
                {h.name || h.ticker}
              </p>
            </div>
            <input
              type="number"
              value={(h.weight * 100).toFixed(1)}
              onChange={(e) => {
                const val = parseFloat(e.target.value) / 100;
                if (!isNaN(val) && val >= 0 && val <= 1) {
                  updateHolding(h.ticker, { weight: val });
                }
              }}
              className="w-16 text-right text-sm font-mono font-medium input-field !py-1 !px-2"
              min="0"
              max="100"
              step="0.5"
            />
            <span className="text-xs text-surface-400">%</span>
            <button
              onClick={() => removeHolding(h.ticker)}
              className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-all"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
