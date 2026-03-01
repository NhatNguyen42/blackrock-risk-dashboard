"use client";

import { useDashboardStore } from "@/store/dashboard";
import { getCommentary } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import {
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

export function AITab() {
  const {
    holdings,
    analysis,
    commentary,
    setCommentary,
    isCommenting,
    setIsCommenting,
  } = useDashboardStore();

  const handleGenerate = async () => {
    if (holdings.length === 0) {
      toast.error("Add holdings first");
      return;
    }
    setIsCommenting(true);
    try {
      const result = await getCommentary(
        holdings,
        analysis?.risk_metrics,
        "Current date: February 2026. Focus on AI infrastructure theme."
      );
      setCommentary(result);
      toast.success("AI commentary generated!");
    } catch (err: any) {
      toast.error(err.message || "Commentary generation failed");
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
            AI Auto Commentary
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
            Intelligent portfolio commentary powered by generative AI
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isCommenting || holdings.length === 0}
          className="btn-primary gap-2"
        >
          {isCommenting ? (
            <LoadingSpinner size="sm" />
          ) : (
            <SparklesIcon className="w-4 h-4" />
          )}
          {isCommenting ? "Generating..." : "Generate Commentary"}
        </button>
      </div>

      {isCommenting ? (
        <div className="glass-card p-12">
          <LoadingSpinner
            size="lg"
            label="AI is analyzing your portfolio..."
            className="py-8"
          />
        </div>
      ) : commentary ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Commentary */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-500/10">
                <SparklesIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="section-title">Portfolio Analysis</h3>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-surface-900 dark:prose-headings:text-white prose-p:text-surface-700 dark:prose-p:text-surface-300 prose-li:text-surface-700 dark:prose-li:text-surface-300 prose-strong:text-surface-900 dark:prose-strong:text-white">
              <ReactMarkdown>{commentary.commentary}</ReactMarkdown>
            </div>
          </div>

          {/* Sidebar: Highlights + Alerts */}
          <div className="space-y-6">
            {/* Highlights */}
            {commentary.highlights.length > 0 && (
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
                    Key Strengths
                  </h3>
                </div>
                <ul className="space-y-2">
                  {commentary.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-surface-700 dark:text-surface-300"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Alerts */}
            {commentary.risk_alerts.length > 0 && (
              <div className="glass-card p-5 border-l-4 border-l-amber-500">
                <div className="flex items-center gap-2 mb-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
                    Risk Alerts
                  </h3>
                </div>
                <ul className="space-y-2">
                  {commentary.risk_alerts.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-surface-700 dark:text-surface-300"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Badge */}
            <div className="glass-card p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <BoltIcon className="w-4 h-4 text-brand-500" />
                <span className="text-xs font-semibold text-surface-600 dark:text-surface-400">
                  Powered by AI
                </span>
              </div>
              <p className="text-[10px] text-surface-400 dark:text-surface-500">
                Commentary is AI-generated and should not be considered
                financial advice. Always verify with professional analysis.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 flex flex-col items-center justify-center">
          <SparklesIcon className="w-16 h-16 text-surface-300 dark:text-surface-700 mb-4" />
          <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-1">
            AI Co-Pilot Ready
          </h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 text-center max-w-md">
            Click &quot;Generate Commentary&quot; for AI-driven insights
            on your portfolio positioning, risk alerts, and actionable
            recommendations.
          </p>
          {!analysis && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
              Tip: Run portfolio analysis on the Overview tab first for richer insights
            </p>
          )}
        </div>
      )}
    </div>
  );
}
