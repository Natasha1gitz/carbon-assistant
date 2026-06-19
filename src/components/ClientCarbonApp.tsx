"use client";

import { useState, useCallback } from "react";
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth";
import type { CarbonInput, FootprintResult, InsightsResponse } from "@/lib/validators";
import { calculateFootprint } from "@/lib/calculator";
import { saveFootprintResult } from "@/app/actions/firebase";
import { generateInsights } from "@/app/actions/gemini";

import CarbonForm from "@/components/CarbonForm";
import Dashboard from "@/components/Dashboard";
import ErrorBoundary from "@/components/ErrorBoundary";
import dynamic from "next/dynamic";

const AiAssistant = dynamic(() => import("@/components/AiAssistant"), {
  loading: () => <p className="text-center text-slate-400">Loading AI Assistant...</p>,
  ssr: false,
});

const HistoryPanel = dynamic(() => import("@/components/HistoryPanel"), {
  ssr: false,
});

interface HistoryEntry {
  id: string;
  created_at: string;
  result: FootprintResult;
}

export default function ClientCarbonApp() {
  const { userId, loading } = useAnonymousAuth();
  const [result, setResult] = useState<FootprintResult | null>(null);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = useCallback(
    async (input: CarbonInput) => {
      setError(null);
      try {
        const footprint = calculateFootprint(input);
        setResult(footprint);

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

        const aiInsights = await generateInsights(input, footprint);
        setInsights(aiInsights);
      } catch {
        setError("Unable to process your footprint. Please try again.");
      }
    },
    [userId]
  );

  const handleRecalculate = useCallback(() => {
    setResult(null);
    setInsights(null);
  }, []);

  return (
    <>
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="glass-card rounded-xl border-red-300 bg-red-50/50 p-4 text-sm font-medium text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300"
        >
          {error}
        </div>
      )}

      <p role="status" className="sr-only">
        {result
          ? "Your footprint results and personalized insights are ready below."
          : ""}
      </p>

      {loading ? (
        <div
          className="animate-fade-in mx-auto flex min-h-[500px] w-full max-w-3xl flex-col items-center justify-center p-16"
          aria-live="polite"
        >
          <div className="relative">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-emerald-200/50 border-t-emerald-500" />
            <div className="absolute inset-0 h-14 w-14 animate-ping rounded-full bg-emerald-400/10" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-400">Initializing...</p>
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
                <div className="relative mb-4 inline-block">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200/50 border-t-emerald-500" />
                  <div className="absolute inset-0 h-10 w-10 animate-ping rounded-full bg-emerald-400/10" />
                </div>
                <p className="font-medium text-slate-500 dark:text-slate-400">
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

            <div className="mt-10 border-t border-slate-200/50 pt-8 text-center dark:border-slate-800/50">
              <button
                onClick={handleRecalculate}
                className="group rounded-xl border border-slate-200/50 bg-slate-100 px-8 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700/50 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300"
              >
                ← Recalculate
              </button>
            </div>
          </div>
        </ErrorBoundary>
      )}
    </>
  );
}
