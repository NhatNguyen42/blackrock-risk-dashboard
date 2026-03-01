"use client";

import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

interface MetricCardProps {
  label: string;
  value: string;
  subLabel?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  subLabel,
  trend,
  icon,
  className,
}: MetricCardProps) {
  return (
    <div className={cn("metric-card group", className)}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
          {label}
        </p>
        {icon && (
          <div className="p-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 group-hover:bg-brand-50 dark:group-hover:bg-brand-500/10 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">
          {value}
        </span>
        {trend && trend !== "neutral" && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium mb-1",
              trend === "up"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-500 dark:text-red-400"
            )}
          >
            {trend === "up" ? (
              <ArrowUpIcon className="w-3 h-3" />
            ) : (
              <ArrowDownIcon className="w-3 h-3" />
            )}
          </span>
        )}
      </div>
      {subLabel && (
        <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
          {subLabel}
        </p>
      )}
    </div>
  );
}
