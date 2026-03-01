"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/store/dashboard";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { OverviewTab } from "@/components/tabs/OverviewTab";
import { RiskTab } from "@/components/tabs/RiskTab";
import { MonteCarloTab } from "@/components/tabs/MonteCarloTab";
import { AITab } from "@/components/tabs/AITab";
import { Toaster } from "react-hot-toast";

export default function Home() {
  const { darkMode, activeTab } = useDashboardStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "risk":
        return <RiskTab />;
      case "montecarlo":
        return <MonteCarloTab />;
      case "ai":
        return <AITab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "!bg-white dark:!bg-surface-800 !text-surface-900 dark:!text-surface-100 !shadow-xl !border !border-surface-200 dark:!border-surface-700",
          duration: 4000,
        }}
      />
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto custom-scrollbar min-h-[calc(100vh-4rem)] flex flex-col">
          <div className="max-w-[1600px] mx-auto animate-fade-in flex-1">
            {renderTab()}
          </div>

          {/* Footer */}
          <footer className="mt-8 pt-4 border-t border-surface-200/50 dark:border-surface-700/50">
            <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">NN</span>
                </div>
                <p className="text-xs text-surface-500 dark:text-surface-400">
                  Designed & built by{" "}
                  <span className="font-semibold text-surface-700 dark:text-surface-200">
                    Nhat Nguyen
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="mailto:Nhatmn114@gmail.com"
                  className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors"
                >
                  Nhatmn114@gmail.com
                </a>
                <span className="text-[10px] text-surface-400 dark:text-surface-600">
                  &copy; {new Date().getFullYear()}
                </span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
