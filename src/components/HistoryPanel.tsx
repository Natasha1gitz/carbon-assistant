"use client";

import React from "react";
import type { FootprintResult } from "@/lib/validators";

interface HistoryEntry {
  id: string;
  created_at: string;
  result: FootprintResult;
}

interface HistoryPanelProps {
  entries: HistoryEntry[];
}

export default function HistoryPanel({ entries }: HistoryPanelProps) {
  if (entries.length === 0) {
    return (
      <div className="glass-card p-8 mt-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">
          📊 History
        </h2>
        <div className="flex flex-col items-center py-8 text-center">
          <span className="text-3xl mb-2">📋</span>
          <p className="text-slate-400 dark:text-slate-500 text-sm italic">
            No previous calculations yet. Your history will appear here after your first
            calculation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 mt-8">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-5">
        📊 Footprint History
      </h2>

      <div className="overflow-x-auto rounded-xl border border-slate-200/30 dark:border-slate-700/30">
        <table className="w-full text-sm text-left">
          <caption className="sr-only">
            Carbon footprint history entries with per-category breakdown
          </caption>
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200/30 dark:border-slate-700/30">
              <th
                scope="col"
                className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Date
              </th>
              <th
                scope="col"
                className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Total
              </th>
              <th
                scope="col"
                className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Transport
              </th>
              <th
                scope="col"
                className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Home
              </th>
              <th
                scope="col"
                className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Diet
              </th>
              <th
                scope="col"
                className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Consumption
              </th>
              <th
                scope="col"
                className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                vs Target
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const r = entry.result;
              const ratio = r.comparison.ratio_to_sustainable_target;
              return (
                <tr
                  key={entry.id}
                  className="border-b border-slate-100/30 dark:border-slate-800/30 hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 tabular-nums">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {r.total_annual_tonnes} t
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 tabular-nums">
                    {r.breakdown_kg.transport} kg
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 tabular-nums">
                    {r.breakdown_kg.home} kg
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 tabular-nums">
                    {r.breakdown_kg.diet} kg
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 tabular-nums">
                    {r.breakdown_kg.consumption} kg
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        ratio <= 1
                          ? "bg-emerald-100/70 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                          : ratio <= 2
                            ? "bg-amber-100/70 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                            : "bg-red-100/70 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {ratio}×
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
