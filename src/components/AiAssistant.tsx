"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import type { InsightsResponse } from "@/lib/validators";
import { chatWithGemini } from "@/app/actions/gemini";

interface AiAssistantProps {
  insights: InsightsResponse;
}

function AiAssistant({ insights }: AiAssistantProps) {
  const [messages, setMessages] = useState<{ role: string; parts: { text: string }[] }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      const userMsg = { role: "user", parts: [{ text: input }] };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      try {
        const responseText = await chatWithGemini(messages, input);
        setMessages((prev) => [
          ...prev,
          { role: "model", parts: [{ text: responseText }] },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "model", parts: [{ text: "Error connecting to AI." }] },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [input, messages]
  );

  return (
    <div className="glass-card mt-8 p-8">
      {/* Header */}
      <div className="mb-2 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
          style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
        >
          🤖
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            AI Reduction Insights
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Source:{" "}
            {insights.source === "gemini" ? "Google Gemini AI" : "Rule-based engine"}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-5 rounded-xl border border-emerald-200/40 bg-emerald-50/40 p-4 dark:border-emerald-800/40 dark:bg-emerald-900/15">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {insights.summary}
        </p>
      </div>

      {/* Recommendation cards */}
      <div className="mt-6 mb-8 grid gap-3 md:grid-cols-2">
        {insights.recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="group rounded-xl border border-slate-200/40 bg-slate-50/60 p-4 transition-all duration-300 hover:border-emerald-300/60 hover:shadow-md hover:shadow-emerald-500/5 dark:border-slate-700/40 dark:bg-slate-800/40 dark:hover:border-emerald-700/60"
          >
            <div className="mb-2.5 flex items-start justify-between">
              <span
                className="rounded-lg px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(5,150,105,0.15), rgba(16,185,129,0.15))",
                  color: "#059669",
                }}
              >
                {rec.category}
              </span>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {rec.action}
            </p>
            <p className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
              <span className="text-base">↓</span>
              Save ~{rec.estimated_annual_savings_kg.toLocaleString()} kg CO₂e/yr
            </p>
          </div>
        ))}
      </div>

      {/* Chat interface */}
      <div className="border-t border-slate-200/40 pt-6 dark:border-slate-700/40">
        <h3 className="mb-4 text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
          Chat with your Carbon Assistant
        </h3>

        <div
          className="mb-4 h-64 space-y-3 overflow-y-auto rounded-xl border border-slate-200/30 bg-slate-50/50 p-4 dark:border-slate-700/30 dark:bg-slate-800/30"
          aria-live="polite"
        >
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="mb-2 text-3xl">💬</span>
              <p className="text-sm text-slate-400 italic dark:text-slate-500">
                Ask me anything about reducing your carbon footprint!
              </p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "rounded-br-md text-white"
                    : "rounded-bl-md border border-slate-200/40 bg-white/80 text-slate-700 shadow-sm backdrop-blur-sm dark:border-slate-700/40 dark:bg-slate-800/80 dark:text-slate-200"
                }`}
                style={
                  msg.role === "user"
                    ? { background: "linear-gradient(135deg, #059669, #10b981)" }
                    : undefined
                }
              >
                {msg.parts[0]?.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="animate-fade-in flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-200/40 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-slate-700/40 dark:bg-slate-800/80">
                <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:100ms]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:200ms]" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., How do I switch to an EV?"
            className="premium-input flex-1"
            aria-label="Ask the AI assistant"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100"
            style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default memo(AiAssistant);
