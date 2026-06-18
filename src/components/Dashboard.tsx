"use client";

import React, { useEffect, useState, useMemo, memo } from "react";
import type { FootprintResult } from "@/lib/validators";

interface DashboardProps {
  result: FootprintResult;
}

const CATEGORY_COLORS = [
  { bar: "#059669", fill: "fill-emerald-500", label: "Transport", bg: "bg-emerald-500" },
  { bar: "#0ea5e9", fill: "fill-sky-500", label: "Home", bg: "bg-sky-500" },
  { bar: "#f59e0b", fill: "fill-amber-500", label: "Diet", bg: "bg-amber-500" },
  { bar: "#f43f5e", fill: "fill-rose-500", label: "Consumption", bg: "bg-rose-500" },
] as const;

/** A single horizontal comparison bar with gradient fill and animation. */
const ComparisonBar = memo(function ComparisonBar({
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
  const formattedValue = (value / 1000).toFixed(1);

  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-right text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <div className="h-6 flex-1 overflow-hidden rounded-full bg-slate-100/70 dark:bg-slate-800/70">
        <div
          className={`bg-gradient-to-r ${gradient} relative h-full rounded-full transition-all duration-1000 ease-out`}
          style={{ width: mounted ? `${widthPct}%` : "0%" }}
        >
          <span className="absolute top-1/2 right-2 -translate-y-1/2 text-[10px] font-bold text-white/90">
            {mounted && widthPct > 15 ? `${formattedValue}t` : ""}
          </span>
        </div>
      </div>
      <span className="w-16 shrink-0 text-sm font-medium text-slate-500 tabular-nums dark:text-slate-400">
        {formattedValue} t
      </span>
    </div>
  );
});

function Dashboard({ result }: DashboardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Memoize expensive derived computations
  const categories = useMemo(
    () => Object.entries(result.breakdown_kg),
    [result.breakdown_kg]
  );
  const maxVal = useMemo(
    () => Math.max(...categories.map(([, val]) => val)),
    [categories]
  );
  const totalKg = result.total_annual_kg;
  const { comparison } = result;

  // Pre-compute the shared maxValue for comparison bars (avoids triple recomputation)
  const comparisonMaxValue = useMemo(
    () => Math.max(totalKg, comparison.global_average_annual_kg),
    [totalKg, comparison.global_average_annual_kg]
  );

  return (
    <div className="glass-card p-8">
      {/* Header with total */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="mb-1 text-lg font-semibold text-slate-500 dark:text-slate-400">
            Your Annual Carbon Footprint
          </h2>
          <div className="flex items-baseline gap-3">
            <span className="gradient-text text-5xl font-extrabold">
              {result.total_annual_tonnes.toLocaleString()}
            </span>
            <span className="text-xl font-medium text-slate-400 dark:text-slate-500">
              t CO₂e / year
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            ({result.total_annual_kg.toLocaleString()} kg)
          </p>
        </div>

        {/* Status Badge */}
        <div
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
            comparison.ratio_to_sustainable_target <= 1
              ? "border border-emerald-200/60 bg-emerald-100/70 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/30 dark:text-emerald-300"
              : comparison.ratio_to_sustainable_target <= 2
                ? "border border-amber-200/60 bg-amber-100/70 text-amber-700 dark:border-amber-700/60 dark:bg-amber-900/30 dark:text-amber-300"
                : "border border-red-200/60 bg-red-100/70 text-red-700 dark:border-red-700/60 dark:bg-red-900/30 dark:text-red-300"
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
        <h3 className="mb-4 text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
          How You Compare
        </h3>

        <div className="space-y-4">
          <ComparisonBar
            label="You"
            value={totalKg}
            maxValue={comparisonMaxValue}
            gradient="from-emerald-500 to-emerald-400"
            mounted={mounted}
          />
          <ComparisonBar
            label="Global Avg"
            value={comparison.global_average_annual_kg}
            maxValue={comparisonMaxValue}
            gradient="from-amber-500 to-amber-400"
            mounted={mounted}
          />
          <ComparisonBar
            label="2030 Target"
            value={comparison.sustainable_target_annual_kg}
            maxValue={comparisonMaxValue}
            gradient="from-sky-500 to-sky-400"
            mounted={mounted}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      <div>
        <h3 className="mb-4 text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
          Breakdown by Category
        </h3>

        {/* Category Cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map(([key, value], i) => {
            const pct = totalKg > 0 ? Math.round((value / totalKg) * 100) : 0;
            const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length]!;
            return (
              <div
                key={key}
                className="rounded-xl border border-slate-200/40 bg-slate-50/70 p-4 transition-all duration-500 dark:border-slate-700/40 dark:bg-slate-800/50"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(12px)",
                  transitionDelay: `${i * 100}ms`,
                }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${color.bg}`} />
                  <span className="text-xs font-semibold tracking-wider text-slate-500 capitalize uppercase dark:text-slate-400">
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
        <div className="relative h-48 w-full rounded-xl border border-slate-200/30 bg-slate-50/50 p-4 dark:border-slate-700/30 dark:bg-slate-800/30">
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
                    className="fill-slate-400 text-[10px] font-semibold uppercase dark:fill-slate-500"
                  >
                    {key}
                  </text>
                  {/* Value label */}
                  <text
                    x={`${xPos + barWidth / 2}%`}
                    y={`${90 - heightPct - 4}%`}
                    textAnchor="middle"
                    className="fill-slate-600 text-xs font-bold dark:fill-slate-300"
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

export default memo(Dashboard);
