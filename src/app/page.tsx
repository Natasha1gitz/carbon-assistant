"use client";

import { useState, useCallback } from "react";
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth";
import type { CarbonInput, FootprintResult, InsightsResponse } from "@/lib/validators";
import { calculateFootprint } from "@/lib/calculator";
import { saveFootprintResult } from "@/app/actions/firebase";
import { generateInsights } from "@/app/actions/gemini";

import CarbonForm from "@/components/CarbonForm";
import Dashboard from "@/components/Dashboard";
import AiAssistant from "@/components/AiAssistant";
import HistoryPanel from "@/components/HistoryPanel";
import ErrorBoundary from "@/components/ErrorBoundary";

interface HistoryEntry {
  id: string;
  created_at: string;
  result: FootprintResult;
}

export default function Home() {
  const { userId, loading } = useAnonymousAuth();
  const [result, setResult] = useState<FootprintResult | null>(null);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = useCallback(
    async (input: CarbonInput) => {
      setError(null);
      try {
        // 1. Calculate Footprint (pure, deterministic, no I/O)
        const footprint = calculateFootprint(input);
        setResult(footprint);

        // 2. Save to Firestore (fire and forget)
        if (userId) {
          saveFootprintResult(userId, input, footprint)
            .then((res) => {
              setHistory((prev) => [
                {
                  id: res.id,
                  created_at: new Date().toISOString(),
                  result: footprint,
                },
                ...prev,
              ]);
            })
            .catch(() => {
              // Firestore save is non-critical — silently degrade
            });
        }

        // 3. Generate AI Insights (Gemini with rule-based fallback)
        const aiInsights = await generateInsights(input, footprint);
        setInsights(aiInsights);
      } catch {
        setError("Unable to process your footprint. Please try again.");
      }
    },
    [userId]
  );

  return (
    <div className="space-y-10">
      {/* Global error alert — always visible regardless of view state */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="glass-card p-4 border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium rounded-xl"
        >
          {error}
        </div>
      )}

      {/* Screen-reader status announcement */}
      <p role="status" className="sr-only">
        {result
          ? "Your footprint results and personalized insights are ready below."
          : ""}
      </p>

      {/* Hero Section */}
      <div className="text-center mb-4 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6 border border-emerald-200/50 dark:border-emerald-800/50">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-ring" />
          AI-Powered Carbon Intelligence
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5 text-slate-900 dark:text-white">
          Know Your Impact. <span className="gradient-text">Make a Difference.</span>
        </h2>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Our intelligent platform calculates your carbon footprint and uses AI to provide
          highly personalized, actionable steps to reduce your environmental impact.
        </p>
      </div>

      {loading ? (
        <div
          className="flex flex-col items-center justify-center p-16 animate-fade-in"
          aria-live="polite"
        >
          <div className="relative">
            <div className="w-14 h-14 border-4 border-emerald-200/50 border-t-emerald-500 rounded-full animate-spin" />
            <div className="absolute inset-0 w-14 h-14 rounded-full bg-emerald-400/10 animate-ping" />
          </div>
          <p className="mt-4 text-sm text-slate-400 font-medium">Initializing...</p>
          <span className="sr-only">Loading application...</span>
        </div>
      ) : !result ? (
        <div
          className="animate-slide-up"
          style={{ animationDelay: "0.15s", animationFillMode: "backwards" }}
        >
          <CarbonForm onSubmit={handleCalculate} />
        </div>
      ) : (
        <ErrorBoundary>
          <div className="space-y-8">
            <div className="animate-slide-up">
              <Dashboard result={result} />
            </div>

            {insights ? (
              <div
                className="animate-slide-up"
                style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
              >
                <AiAssistant insights={insights} />
              </div>
            ) : (
              <div className="glass-card p-10 text-center" aria-live="polite">
                <div className="relative inline-block mb-4">
                  <div className="w-10 h-10 border-4 border-emerald-200/50 border-t-emerald-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 w-10 h-10 rounded-full bg-emerald-400/10 animate-ping" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  Gemini AI is analyzing your footprint...
                </p>
              </div>
            )}

            <div
              className="animate-slide-up"
              style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}
            >
              <HistoryPanel entries={history} />
            </div>

            <div className="text-center mt-10 pt-8 border-t border-slate-200/50 dark:border-slate-800/50">
              <button
                onClick={() => {
                  setResult(null);
                  setInsights(null);
                }}
                className="group px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200/50 dark:border-slate-700/50 hover:border-emerald-300 dark:hover:border-emerald-700"
              >
                ← Recalculate
              </button>
            </div>
          </div>
        </ErrorBoundary>
      )}
    </div>
  );
}
