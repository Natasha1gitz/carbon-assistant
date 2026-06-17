"use client";

import React, { useEffect, useState } from "react";
import type { FootprintResult } from "@/lib/validators";

interface DashboardProps {
  result: FootprintResult;
}

const CATEGORY_COLORS = [
  { bar: "#059669", fill: "fill-emerald-500", label: "Transport", bg: "bg-emerald-500" },
  { bar: "#0ea5e9", fill: "fill-sky-500", label: "Home", bg: "bg-sky-500" },
  { bar: "#f59e0b", fill: "fill-amber-500", label: "Diet", bg: "bg-amber-500" },
  { bar: "#f43f5e", fill: "fill-rose-500", label: "Consumption", bg: "bg-rose-500" },
];

export default function Dashboard({ result }: DashboardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const categories = Object.entries(result.breakdown_kg);
  const maxVal = Math.max(...categories.map(([, val]) => val));
  const totalKg = result.total_annual_kg;
  const { comparison } = result;

  return (
    <div className="glass-card p-8">
      {/* Header with total */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Your Annual Carbon Footprint
          </h2>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-extrabold gradient-text">
              {result.total_annual_tonnes.toLocaleString()}
            </span>
            <span className="text-xl text-slate-400 dark:text-slate-500 font-medium">
              t CO₂e / year
            </span>
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            ({result.total_annual_kg.toLocaleString()} kg)
          </p>
        </div>

        {/* Status Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
            comparison.ratio_to_sustainable_target <= 1
              ? "bg-emerald-100/70 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-700/60"
              : comparison.ratio_to_sustainable_target <= 2
                ? "bg-amber-100/70 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-700/60"
                : "bg-red-100/70 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-700/60"
          }`}
        >
          {comparison.ratio_to_sustainable_target <= 1
            ? "🎉"
            : comparison.ratio_to_sustainable_target <= 2
              ? "⚠️"
              : "🔴"}
          {comparison.ratio_to_sustainable_target <= 1
            ? "Below target!"
            : `${comparison.ratio_to_sustainable_target}× sustainable target`}
        </div>
      </div>

      {/* Comparison bars */}
      <div className="mb-10">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          How You Compare
        </h3>

        <div className="space-y-4">
          <ComparisonBar
            label="You"
            value={result.total_annual_kg}
            maxValue={Math.max(
              result.total_annual_kg,
              comparison.global_average_annual_kg
            )}
            gradient="from-emerald-500 to-emerald-400"
            mounted={mounted}
          />
          <ComparisonBar
            label="Global Avg"
            value={comparison.global_average_annual_kg}
            maxValue={Math.max(
              result.total_annual_kg,
              comparison.global_average_annual_kg
            )}
            gradient="from-amber-500 to-amber-400"
            mounted={mounted}
          />
          <ComparisonBar
            label="2030 Target"
            value={comparison.sustainable_target_annual_kg}
            maxValue={Math.max(
              result.total_annual_kg,
              comparison.global_average_annual_kg
            )}
            gradient="from-sky-500 to-sky-400"
            mounted={mounted}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          Breakdown by Category
        </h3>

        {/* Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {categories.map(([key, value], i) => {
            const pct = totalKg > 0 ? Math.round((value / totalKg) * 100) : 0;
            const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length]!;
            return (
              <div
                key={key}
                className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-700/40 transition-all duration-500"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(12px)",
                  transitionDelay: `${i * 100}ms`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${color.bg}`} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 capitalize">
                    {key}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {Math.round(value).toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">kg · {pct}%</p>
              </div>
            );
          })}
        </div>

        {/* SVG Bar Chart */}
        <div className="relative h-48 w-full rounded-xl bg-slate-50/50 dark:bg-slate-800/30 p-4 border border-slate-200/30 dark:border-slate-700/30">
          <svg
            width="100%"
            height="100%"
            role="img"
            aria-label="Bar chart showing carbon footprint breakdown by category"
            preserveAspectRatio="none"
          >
            {categories.map(([key, value], i) => {
              const heightPct = maxVal > 0 ? (value / maxVal) * 80 : 0;
              const barWidth = 100 / categories.length;
              const xPos = i * barWidth;
              const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length]!;

              return (
                <g key={key}>
                  {/* Bar with rounded top */}
                  <rect
                    x={`${xPos + 8}%`}
                    y={`${90 - heightPct}%`}
                    width={`${barWidth - 16}%`}
                    height={`${heightPct}%`}
                    rx="4"
                    className={`${color.fill} transition-all duration-1000 ease-out`}
                    style={{
                      opacity: mounted ? 0.85 : 0,
                      transform: mounted ? "scaleY(1)" : "scaleY(0)",
                      transformOrigin: "bottom",
                      transitionDelay: `${i * 150}ms`,
                    }}
                  />
                  {/* Category label */}
                  <text
                    x={`${xPos + barWidth / 2}%`}
                    y="98%"
                    textAnchor="middle"
                    className="fill-slate-400 dark:fill-slate-500 text-[10px] font-semibold uppercase"
                  >
                    {key}
                  </text>
                  {/* Value label */}
                  <text
                    x={`${xPos + barWidth / 2}%`}
                    y={`${90 - heightPct - 4}%`}
                    textAnchor="middle"
                    className="fill-slate-600 dark:fill-slate-300 text-xs font-bold"
                    style={{
                      opacity: mounted ? 1 : 0,
                      transition: "opacity 1s ease-out",
                      transitionDelay: `${i * 150 + 500}ms`,
                    }}
                  >
                    {Math.round(value)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Visually hidden table for screen readers */}
        <table className="sr-only">
          <caption>Carbon footprint breakdown by category</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Emissions (kg CO₂e)</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** A single horizontal comparison bar with gradient fill and animation. */
function ComparisonBar({
  label,
  value,
  maxValue,
  gradient,
  mounted,
}: {
  label: string;
  value: number;
  maxValue: number;
  gradient: string;
  mounted: boolean;
}) {
  const widthPct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-sm text-slate-500 dark:text-slate-400 font-medium text-right shrink-0">
        {label}
      </span>
      <div className="flex-1 bg-slate-100/70 dark:bg-slate-800/70 rounded-full h-6 overflow-hidden">
        <div
          className={`bg-gradient-to-r ${gradient} h-full rounded-full transition-all duration-1000 ease-out relative`}
          style={{ width: mounted ? `${widthPct}%` : "0%" }}
        >
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/90">
            {mounted && widthPct > 15 ? `${(value / 1000).toFixed(1)}t` : ""}
          </span>
        </div>
      </div>
      <span className="w-16 text-sm text-slate-500 dark:text-slate-400 font-medium tabular-nums shrink-0">
        {(value / 1000).toFixed(1)} t
      </span>
    </div>
  );
}
