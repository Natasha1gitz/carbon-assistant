"use client";

import React, { useState } from "react";
import type { CarbonInput } from "@/lib/validators";
import { CarbonInputSchema } from "@/lib/validators";

interface CarbonFormProps {
  onSubmit: (data: CarbonInput) => void;
}

const DIET_OPTIONS = [
  { value: "heavy_meat", label: "Heavy meat eater", icon: "🥩" },
  { value: "medium_meat", label: "Medium meat eater", icon: "🍖" },
  { value: "low_meat", label: "Low meat / flexitarian", icon: "🥘" },
  { value: "pescatarian", label: "Pescatarian", icon: "🐟" },
  { value: "vegetarian", label: "Vegetarian", icon: "🥕" },
  { value: "vegan", label: "Vegan", icon: "🌱" },
] as const;

const FUEL_OPTIONS = [
  { value: "petrol", label: "Petrol / Gasoline" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "electric", label: "Electric" },
] as const;

const STEP_LABELS = [
  { num: 1, icon: "🚗", label: "Transport" },
  { num: 2, icon: "🏠", label: "Home" },
  { num: 3, icon: "🥗", label: "Diet" },
  { num: 4, icon: "🛍️", label: "Consumption" },
] as const;

export default function CarbonForm({ onSubmit }: CarbonFormProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transport
  const [carKm, setCarKm] = useState<number | "">("");
  const [carFuel, setCarFuel] = useState<string>("petrol");
  const [transitKm, setTransitKm] = useState<number | "">("");
  const [shortFlights, setShortFlights] = useState<number | "">("");
  const [longFlights, setLongFlights] = useState<number | "">("");

  // Home
  const [electricityKwh, setElectricityKwh] = useState<number | "">("");
  const [gasKwh, setGasKwh] = useState<number | "">("");
  const [householdSize, setHouseholdSize] = useState<number | "">(1);

  // Diet
  const [diet, setDiet] = useState<string>("medium_meat");

  // Consumption
  const [goodsSpend, setGoodsSpend] = useState<number | "">("");
  const [wasteKg, setWasteKg] = useState<number | "">("");

  const handleNext = () => setStep((s) => Math.min(s + 1, totalSteps));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const raw = {
      transport: {
        car_km_per_week: Number(carKm),
        car_fuel: carFuel,
        public_transit_km_per_week: Number(transitKm),
        short_haul_flights_per_year: Number(shortFlights),
        long_haul_flights_per_year: Number(longFlights),
      },
      home: {
        electricity_kwh_per_month: Number(electricityKwh),
        natural_gas_kwh_per_month: Number(gasKwh),
        household_size: Number(householdSize) || 1,
      },
      diet,
      consumption: {
        goods_spend_usd_per_month: Number(goodsSpend),
        waste_kg_per_week: Number(wasteKg),
      },
    };

    const result = CarbonInputSchema.safeParse(raw);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const newErrors: Record<string, string> = {};
      for (const [key, value] of Object.entries(fieldErrors)) {
        const first = value?.[0];
        if (first) newErrors[key] = first;
      }
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto glass-card p-8">
      <div aria-live="polite" className="sr-only">
        {isSubmitting
          ? "Calculating your carbon footprint..."
          : `Step ${step} of ${totalSteps}`}
      </div>

      {/* Premium Step Indicator */}
      <div
        className="flex items-center justify-between mb-8 px-2"
        aria-label="Form Progress"
        role="navigation"
      >
        {STEP_LABELS.map((s, i) => (
          <React.Fragment key={s.num}>
            <button
              type="button"
              onClick={() => setStep(s.num)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                step >= s.num ? "opacity-100 scale-100" : "opacity-40 scale-95"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-500 ${
                  step === s.num
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-110"
                    : step > s.num
                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                {step > s.num ? "✓" : s.icon}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  step === s.num
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </button>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-700 ${
                  step > s.num ? "progress-active" : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="min-h-[320px]">
        {/* ── Step 1: Transport ────────────────────────── */}
        {step === 1 && (
          <fieldset className="space-y-5 animate-fade-in">
            <legend className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-5">
              🚗 Transport
            </legend>

            <div className="flex flex-col">
              <label
                htmlFor="car_km"
                className="mb-1.5 font-medium text-sm text-slate-600 dark:text-slate-300"
              >
                Car distance per week (km)
              </label>
              <input
                id="car_km"
                type="number"
                min="0"
                placeholder="e.g. 120"
                value={carKm}
                onChange={(e) =>
                  setCarKm(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="premium-input"
                aria-describedby={errors.car_km_per_week ? "car_km_err" : undefined}
              />
              {errors.car_km_per_week && (
                <span id="car_km_err" className="text-red-500 text-sm mt-1">
                  {errors.car_km_per_week}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="car_fuel"
                className="mb-1.5 font-medium text-sm text-slate-600 dark:text-slate-300"
              >
                Car fuel type
              </label>
              <select
                id="car_fuel"
                value={carFuel}
                onChange={(e) => setCarFuel(e.target.value)}
                className="premium-input cursor-pointer"
              >
                {FUEL_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="transit_km"
                className="mb-1.5 font-medium text-sm text-slate-600 dark:text-slate-300"
              >
                Public transit per week (km)
              </label>
              <input
                id="transit_km"
                type="number"
                min="0"
                placeholder="e.g. 30"
                value={transitKm}
                onChange={(e) =>
                  setTransitKm(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="premium-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label
                  htmlFor="short_flights"
                  className="mb-1.5 font-medium text-sm text-slate-600 dark:text-slate-300"
                >
                  Short-haul flights/yr
                </label>
                <input
                  id="short_flights"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={shortFlights}
                  onChange={(e) =>
                    setShortFlights(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="premium-input"
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="long_flights"
                  className="mb-1.5 font-medium text-sm text-slate-600 dark:text-slate-300"
                >
                  Long-haul flights/yr
                </label>
                <input
                  id="long_flights"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={longFlights}
                  onChange={(e) =>
                    setLongFlights(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="premium-input"
                />
              </div>
            </div>
          </fieldset>
        )}

        {/* ── Step 2: Home Energy ─────────────────────── */}
        {step === 2 && (
          <fieldset className="space-y-5 animate-fade-in">
            <legend className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-5">
              🏠 Home Energy
            </legend>

            <div className="flex flex-col">
              <label
                htmlFor="elec_kwh"
                className="mb-1.5 font-medium text-sm text-slate-600 dark:text-slate-300"
              >
                Electricity per month (kWh)
              </label>
              <input
                id="elec_kwh"
                type="number"
                min="0"
                placeholder="e.g. 300"
                value={electricityKwh}
                onChange={(e) =>
                  setElectricityKwh(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="premium-input"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="gas_kwh"
                className="mb-1.5 font-medium text-sm text-slate-600 dark:text-slate-300"
              >
                Natural gas per month (kWh)
              </label>
              <input
                id="gas_kwh"
                type="number"
                min="0"
                placeholder="e.g. 150"
                value={gasKwh}
                onChange={(e) =>
                  setGasKwh(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="premium-input"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="household"
                className="mb-1.5 font-medium text-sm text-slate-600 dark:text-slate-300"
              >
                People in household
              </label>
              <input
                id="household"
                type="number"
                min="1"
                max="50"
                value={householdSize}
                onChange={(e) =>
                  setHouseholdSize(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="premium-input"
              />
            </div>
          </fieldset>
        )}

        {/* ── Step 3: Diet ────────────────────────────── */}
        {step === 3 && (
          <fieldset className="space-y-5 animate-fade-in">
            <legend className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-5">
              🥗 Diet
            </legend>
            <div className="flex flex-col space-y-2.5">
              {DIET_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all duration-300 border ${
                    diet === opt.value
                      ? "border-emerald-400 bg-emerald-50/60 dark:bg-emerald-900/20 shadow-sm shadow-emerald-500/10"
                      : "border-slate-200/60 dark:border-slate-700/60 hover:border-emerald-300/60 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="diet"
                    value={opt.value}
                    checked={diet === opt.value}
                    onChange={(e) => setDiet(e.target.value)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-lg">{opt.icon}</span>
                  <span className="font-medium text-sm text-slate-700 dark:text-slate-200">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {/* ── Step 4: Consumption ─────────────────────── */}
        {step === 4 && (
          <fieldset className="space-y-5 animate-fade-in">
            <legend className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-5">
              🛍️ Consumption & Waste
            </legend>

            <div className="flex flex-col">
              <label
                htmlFor="goods_spend"
                className="mb-1.5 font-medium text-sm text-slate-600 dark:text-slate-300"
              >
                Goods spending per month (USD)
              </label>
              <input
                id="goods_spend"
                type="number"
                min="0"
                placeholder="e.g. 200"
                value={goodsSpend}
                onChange={(e) =>
                  setGoodsSpend(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="premium-input"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="waste_kg"
                className="mb-1.5 font-medium text-sm text-slate-600 dark:text-slate-300"
              >
                Waste per week (kg)
              </label>
              <input
                id="waste_kg"
                type="number"
                min="0"
                placeholder="e.g. 5"
                value={wasteKg}
                onChange={(e) =>
                  setWasteKg(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="premium-input"
              />
            </div>
          </fieldset>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-slate-200/40 dark:border-slate-700/40">
        <button
          type="button"
          onClick={handlePrev}
          disabled={step === 1 || isSubmitting}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 disabled:opacity-30 transition-all duration-300"
        >
          ← Back
        </button>

        {step < totalSteps ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
          >
            Next →
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
          >
            {isSubmitting ? "Calculating..." : "Calculate Footprint →"}
          </button>
        )}
      </div>
    </form>
  );
}
