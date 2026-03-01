"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
  label,
}: LoadingSpinnerProps) {
  const sizeMap = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div
        className={cn(
          sizeMap[size],
          "border-2 border-surface-200 dark:border-surface-700 border-t-brand-500 rounded-full animate-spin"
        )}
      />
      {label && (
        <p className="text-sm text-surface-500 dark:text-surface-400 animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("glass-card p-5 animate-pulse", className)}>
      <div className="h-3 w-24 bg-surface-200 dark:bg-surface-700 rounded mb-3" />
      <div className="h-8 w-32 bg-surface-200 dark:bg-surface-700 rounded mb-2" />
      <div className="h-3 w-20 bg-surface-100 dark:bg-surface-800 rounded" />
    </div>
  );
}
