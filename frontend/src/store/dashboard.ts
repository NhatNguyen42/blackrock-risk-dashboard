/* ── Global state management with Zustand ─────────────────── */

import { create } from "zustand";
import type {
  Holding,
  PortfolioAnalysis,
  MonteCarloResult,
  Commentary,
} from "@/types";

interface DashboardState {
  // Portfolio
  holdings: Holding[];
  benchmark: string;
  setHoldings: (h: Holding[]) => void;
  addHolding: (h: Holding) => void;
  removeHolding: (ticker: string) => void;
  updateHolding: (ticker: string, updates: Partial<Holding>) => void;
  setBenchmark: (b: string) => void;

  // Analysis results
  analysis: PortfolioAnalysis | null;
  setAnalysis: (a: PortfolioAnalysis | null) => void;

  // Monte Carlo
  monteCarlo: MonteCarloResult | null;
  setMonteCarlo: (mc: MonteCarloResult | null) => void;

  // AI Commentary
  commentary: Commentary | null;
  setCommentary: (c: Commentary | null) => void;

  // UI state
  isAnalyzing: boolean;
  setIsAnalyzing: (v: boolean) => void;
  isSimulating: boolean;
  setIsSimulating: (v: boolean) => void;
  isCommenting: boolean;
  setIsCommenting: (v: boolean) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  // Portfolio
  holdings: [
    { ticker: "AAPL", weight: 0.2, name: "Apple Inc." },
    { ticker: "MSFT", weight: 0.2, name: "Microsoft Corp." },
    { ticker: "NVDA", weight: 0.15, name: "NVIDIA Corp." },
    { ticker: "GOOGL", weight: 0.15, name: "Alphabet Inc." },
    { ticker: "AMZN", weight: 0.1, name: "Amazon.com Inc." },
    { ticker: "JPM", weight: 0.1, name: "JPMorgan Chase" },
    { ticker: "JNJ", weight: 0.1, name: "Johnson & Johnson" },
  ],
  benchmark: "SPY",
  setHoldings: (holdings) => set({ holdings }),
  addHolding: (h) =>
    set((s) => ({
      holdings: [...s.holdings.filter((x) => x.ticker !== h.ticker), h],
    })),
  removeHolding: (ticker) =>
    set((s) => ({
      holdings: s.holdings.filter((h) => h.ticker !== ticker),
    })),
  updateHolding: (ticker, updates) =>
    set((s) => ({
      holdings: s.holdings.map((h) =>
        h.ticker === ticker ? { ...h, ...updates } : h
      ),
    })),
  setBenchmark: (benchmark) => set({ benchmark }),

  // Analysis
  analysis: null,
  setAnalysis: (analysis) => set({ analysis }),

  // Monte Carlo
  monteCarlo: null,
  setMonteCarlo: (monteCarlo) => set({ monteCarlo }),

  // Commentary
  commentary: null,
  setCommentary: (commentary) => set({ commentary }),

  // UI
  isAnalyzing: false,
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  isSimulating: false,
  setIsSimulating: (isSimulating) => set({ isSimulating }),
  isCommenting: false,
  setIsCommenting: (isCommenting) => set({ isCommenting }),
  darkMode: true,
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  activeTab: "overview",
  setActiveTab: (activeTab) => set({ activeTab }),
}));
