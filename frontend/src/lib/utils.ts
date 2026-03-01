import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(val: number, decimals = 2): string {
  return `${(val * 100).toFixed(decimals)}%`;
}

export function formatNumber(val: number, decimals = 2): string {
  return val.toFixed(decimals);
}

export function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatMarketCap(val: number): string {
  if (val >= 1e12) return `$${(val / 1e12).toFixed(1)}T`;
  if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(0)}M`;
  return formatCurrency(val);
}

export const CHART_COLORS = [
  "#2aa3ff", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
];

export const SECTOR_COLORS: Record<string, string> = {
  Technology: "#2aa3ff",
  Healthcare: "#10b981",
  "Financial Services": "#f59e0b",
  "Consumer Cyclical": "#ef4444",
  Communication: "#8b5cf6",
  "Consumer Defensive": "#ec4899",
  Energy: "#06b6d4",
  Industrials: "#84cc16",
  Utilities: "#f97316",
  "Real Estate": "#6366f1",
  "Basic Materials": "#14b8a6",
  Unknown: "#94a3b8",
};
