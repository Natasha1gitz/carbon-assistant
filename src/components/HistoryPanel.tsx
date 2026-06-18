import React, { memo } from "react";
import type { FootprintResult } from "@/lib/validators";

interface HistoryEntry {
  id: string;
  created_at: string;
  result: FootprintResult;
}

interface HistoryPanelProps {
  entries: HistoryEntry[];
}

function HistoryPanel({ entries }: HistoryPanelProps) {
  if (entries.length === 0) {
    return (
      <div className="glass-card mt-8 p-8">
        <h2 className="mb-3 text-xl font-bold text-slate-800 dark:text-slate-100">
          📊 History
        </h2>
        <div className="flex flex-col items-center py-8 text-center">
          <span className="mb-2 text-3xl">📋</span>
          <p className="text-sm text-slate-400 italic dark:text-slate-500">
            No previous calculations yet. Your history will appear here after your first
            calculation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card mt-8 p-8">
      <h2 className="mb-5 text-xl font-bold text-slate-800 dark:text-slate-100">
        📊 Footprint History
      </h2>

      <div className="overflow-x-auto rounded-xl border border-slate-200/30 dark:border-slate-700/30">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Carbon footprint history entries with per-category breakdown
          </caption>
          <thead>
            <tr className="border-b border-slate-200/30 bg-slate-50/50 dark:border-slate-700/30 dark:bg-slate-800/50">
              <th
                scope="col"
                className="px-4 py-3 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400"
              >
                Total
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400"
              >
                Transport
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400"
              >
                Home
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400"
              >
                Diet
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400"
              >
                Consumption
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400"
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
                  className="border-b border-slate-100/30 transition-colors hover:bg-slate-50/30 dark:border-slate-800/30 dark:hover:bg-slate-800/30"
                >
                  <td className="px-4 py-3 text-slate-700 tabular-nums dark:text-slate-300">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
                    {r.total_annual_tonnes} t
                  </td>
                  <td className="px-4 py-3 text-slate-600 tabular-nums dark:text-slate-400">
                    {r.breakdown_kg.transport} kg
                  </td>
                  <td className="px-4 py-3 text-slate-600 tabular-nums dark:text-slate-400">
                    {r.breakdown_kg.home} kg
                  </td>
                  <td className="px-4 py-3 text-slate-600 tabular-nums dark:text-slate-400">
                    {r.breakdown_kg.diet} kg
                  </td>
                  <td className="px-4 py-3 text-slate-600 tabular-nums dark:text-slate-400">
                    {r.breakdown_kg.consumption} kg
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                        ratio <= 1
                          ? "bg-emerald-100/70 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : ratio <= 2
                            ? "bg-amber-100/70 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                            : "bg-red-100/70 text-red-700 dark:bg-red-900/30 dark:text-red-300"
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

export default memo(HistoryPanel);
