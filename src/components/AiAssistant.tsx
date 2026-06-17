"use client";

import React, { useState, useRef, useEffect } from "react";
import type { InsightsResponse } from "@/lib/validators";
import { chatWithGemini } from "@/app/actions/gemini";

interface AiAssistantProps {
  insights: InsightsResponse;
}

export default function AiAssistant({ insights }: AiAssistantProps) {
  const [messages, setMessages] = useState<{ role: string; parts: { text: string }[] }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
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
  };

  return (
    <div className="glass-card p-8 mt-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
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
      <div className="mt-5 rounded-xl p-4 border border-emerald-200/40 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-900/15">
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {insights.summary}
        </p>
      </div>

      {/* Recommendation cards */}
      <div className="grid gap-3 md:grid-cols-2 mt-6 mb-8">
        {insights.recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="group p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40 hover:border-emerald-300/60 dark:hover:border-emerald-700/60 transition-all duration-300 hover:shadow-md hover:shadow-emerald-500/5"
          >
            <div className="flex justify-between items-start mb-2.5">
              <span
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(5,150,105,0.15), rgba(16,185,129,0.15))",
                  color: "#059669",
                }}
              >
                {rec.category}
              </span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
              {rec.action}
            </p>
            <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center gap-1.5">
              <span className="text-base">↓</span>
              Save ~{rec.estimated_annual_savings_kg.toLocaleString()} kg CO₂e/yr
            </p>
          </div>
        ))}
      </div>

      {/* Chat interface */}
      <div className="border-t border-slate-200/40 dark:border-slate-700/40 pt-6">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          Chat with your Carbon Assistant
        </h3>

        <div
          className="rounded-xl h-64 overflow-y-auto p-4 mb-4 space-y-3 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/30 dark:border-slate-700/30"
          aria-live="polite"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-3xl mb-2">💬</span>
              <p className="text-slate-400 dark:text-slate-500 text-sm italic">
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
                    ? "text-white rounded-br-md"
                    : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/40 dark:border-slate-700/40 text-slate-700 dark:text-slate-200 rounded-bl-md shadow-sm"
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
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/40 dark:border-slate-700/40 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:100ms]" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:200ms]" />
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
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100"
            style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
