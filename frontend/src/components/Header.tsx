"use client";

import { useDashboardStore } from "@/store/dashboard";
import { SunIcon, MoonIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { downloadPdfReport } from "@/lib/api";
import toast from "react-hot-toast";

export function Header() {
  const {
    darkMode,
    toggleDarkMode,
    holdings,
    analysis,
    commentary,
    monteCarlo,
  } = useDashboardStore();

  const handleExportPdf = async () => {
    if (!holdings.length) {
      toast.error("Add holdings first");
      return;
    }
    try {
      toast.loading("Generating PDF report...", { id: "pdf" });
      const blob = await downloadPdfReport(
        holdings,
        analysis?.risk_metrics,
        commentary?.commentary,
        monteCarlo?.final_values as Record<string, unknown> | undefined
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "blackrock_risk_report.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Report downloaded!", { id: "pdf" });
    } catch (err) {
      toast.error("PDF generation failed", { id: "pdf" });
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-card !rounded-none border-b border-surface-200/50 dark:border-surface-700/50">
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 h-16">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-surface-900 dark:text-white">
              Blackrock<span className="text-brand-500">Risk</span>
            </h1>
            <p className="text-[11px] text-surface-500 dark:text-surface-400 -mt-0.5">
              Portfolio Analytics Dashboard
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPdf}
            className="btn-secondary !px-3 !py-2 gap-1.5"
            title="Export PDF Report"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Export PDF</span>
          </button>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode ? (
              <SunIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <MoonIcon className="w-5 h-5 text-surface-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
