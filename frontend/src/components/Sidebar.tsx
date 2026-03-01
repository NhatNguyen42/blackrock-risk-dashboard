"use client";

import { useDashboardStore } from "@/store/dashboard";
import { cn } from "@/lib/utils";
import {
  ChartBarIcon,
  ShieldExclamationIcon,
  CubeTransparentIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const tabs = [
  { id: "overview", label: "Overview", icon: ChartBarIcon },
  { id: "risk", label: "Risk Analysis", icon: ShieldExclamationIcon },
  { id: "montecarlo", label: "Monte Carlo", icon: CubeTransparentIcon },
  { id: "ai", label: "AI Commentary", icon: SparklesIcon },
];

export function Sidebar() {
  const { activeTab, setActiveTab } = useDashboardStore();

  return (
    <aside className="hidden md:flex flex-col w-56 lg:w-64 min-h-[calc(100vh-4rem)] border-r border-surface-200/50 dark:border-surface-700/50 bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm p-3 gap-1">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 px-3 pt-2 pb-2">
        Navigation
      </p>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              active
                ? "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 shadow-sm"
                : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-200"
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5 flex-shrink-0",
                active ? "text-brand-600 dark:text-brand-400" : ""
              )}
            />
            {tab.label}
          </button>
        );
      })}

      {/* Quick Stats */}
      <div className="mt-auto pt-4 px-3 pb-2 space-y-3">
        <div className="glass-card p-3 !rounded-xl">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 mb-2">
            Quick Info
          </p>
          <div className="space-y-1 text-xs text-surface-600 dark:text-surface-400">
            <p>Data: yfinance</p>
            <p>AI: Auto Commentary</p>
            <p>Updated: Live</p>
          </div>
        </div>

        {/* Creator Card */}
        <div className="glass-card p-3 !rounded-xl border-t-2 border-t-brand-500">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 flex items-center justify-center shadow-md shadow-brand-500/20">
              <span className="text-xs font-bold text-white">NN</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-surface-900 dark:text-white leading-tight">
                Nhat Nguyen
              </p>
              <p className="text-[10px] text-surface-400 dark:text-surface-500 leading-tight">
                Creator & Developer
              </p>
            </div>
          </div>
          <a
            href="mailto:Nhatmn114@gmail.com"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors group"
          >
            <svg className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <span className="text-[11px] font-medium text-brand-600 dark:text-brand-400 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors truncate">
              Nhatmn114@gmail.com
            </span>
          </a>
        </div>
      </div>
    </aside>
  );
}
