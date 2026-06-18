"use client";

import React, { useReducer, useCallback, memo } from "react";
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

const TOTAL_STEPS = 4;
const FIRST_STEP = 1;

/** Consolidated form state managed by useReducer for efficiency. */
interface FormState {
  step: number;
  errors: Record<string, string>;
  isSubmitting: boolean;
  carKm: number | "";
  carFuel: string;
  transitKm: number | "";
  shortFlights: number | "";
  longFlights: number | "";
  electricityKwh: number | "";
  gasKwh: number | "";
  householdSize: number | "";
  diet: string;
  goodsSpend: number | "";
  wasteKg: number | "";
}

type FormAction =
  | { type: "SET_STEP"; step: number }
  | { type: "SET_FIELD"; field: keyof FormState; value: number | "" | string }
  | { type: "SET_ERRORS"; errors: Record<string, string> }
  | { type: "SET_SUBMITTING"; isSubmitting: boolean };

const initialState: FormState = {
  step: 1,
  errors: {},
  isSubmitting: false,
  carKm: "",
  carFuel: "petrol",
  transitKm: "",
  shortFlights: "",
  longFlights: "",
  electricityKwh: "",
  gasKwh: "",
  householdSize: 1,
  diet: "medium_meat",
  goodsSpend: "",
  wasteKg: "",
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.isSubmitting };
    default:
      return state;
  }
}

function CarbonForm({ onSubmit }: CarbonFormProps) {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const handleNext = useCallback(
    () => dispatch({ type: "SET_STEP", step: Math.min(state.step + 1, TOTAL_STEPS) }),
    [state.step]
  );
  const handlePrev = useCallback(
    () => dispatch({ type: "SET_STEP", step: Math.max(state.step - 1, FIRST_STEP) }),
    [state.step]
  );

  const handleNumberChange = useCallback(
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({
        type: "SET_FIELD",
        field,
        value: e.target.value === "" ? "" : Number(e.target.value),
      });
    },
    []
  );

  const handleStringChange = useCallback(
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        dispatch({ type: "SET_FIELD", field, value: e.target.value });
      },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const raw = {
        transport: {
          car_km_per_week: Number(state.carKm),
          car_fuel: state.carFuel,
          public_transit_km_per_week: Number(state.transitKm),
          short_haul_flights_per_year: Number(state.shortFlights),
          long_haul_flights_per_year: Number(state.longFlights),
        },
        home: {
          electricity_kwh_per_month: Number(state.electricityKwh),
          natural_gas_kwh_per_month: Number(state.gasKwh),
          household_size: Number(state.householdSize) || 1,
        },
        diet: state.diet,
        consumption: {
          goods_spend_usd_per_month: Number(state.goodsSpend),
          waste_kg_per_week: Number(state.wasteKg),
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
        dispatch({ type: "SET_ERRORS", errors: newErrors });
        return;
      }

      dispatch({ type: "SET_ERRORS", errors: {} });
      dispatch({ type: "SET_SUBMITTING", isSubmitting: true });
      onSubmit(result.data);
    },
    [state, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="glass-card mx-auto max-w-xl p-8">
      <div aria-live="polite" className="sr-only">
        {state.isSubmitting
          ? "Calculating your carbon footprint..."
          : `Step ${state.step} of ${TOTAL_STEPS}`}
      </div>

      {/* Premium Step Indicator */}
      <div
        className="mb-8 flex items-center justify-between px-2"
        aria-label="Form Progress"
        role="navigation"
      >
        {STEP_LABELS.map((s, i) => (
          <React.Fragment key={s.num}>
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_STEP", step: s.num })}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                state.step >= s.num ? "scale-100 opacity-100" : "scale-95 opacity-40"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all duration-500 ${
                  state.step === s.num
                    ? "scale-110 bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                    : state.step > s.num
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                }`}
              >
                {state.step > s.num ? "✓" : s.icon}
              </div>
              <span
                className={`hidden text-xs font-medium sm:block ${
                  state.step === s.num
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </button>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 rounded-full transition-all duration-700 ${
                  state.step > s.num
                    ? "progress-active"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="min-h-[320px]">
        {/* ── Step 1: Transport ────────────────────────── */}
        {state.step === 1 && (
          <fieldset className="animate-fade-in space-y-5">
            <legend className="mb-5 text-xl font-bold text-slate-800 dark:text-slate-100">
              🚗 Transport
            </legend>

            <div className="flex flex-col">
              <label
                htmlFor="car_km"
                className="mb-1.5 text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                Car distance per week (km)
              </label>
              <input
                id="car_km"
                type="number"
                min="0"
                placeholder="e.g. 120"
                value={state.carKm}
                onChange={handleNumberChange("carKm")}
                className="premium-input"
                aria-describedby={state.errors.car_km_per_week ? "car_km_err" : undefined}
              />
              {state.errors.car_km_per_week && (
                <span id="car_km_err" className="mt-1 text-sm text-red-500">
                  {state.errors.car_km_per_week}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="car_fuel"
                className="mb-1.5 text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                Car fuel type
              </label>
              <select
                id="car_fuel"
                value={state.carFuel}
                onChange={handleStringChange("carFuel")}
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
                className="mb-1.5 text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                Public transit per week (km)
              </label>
              <input
                id="transit_km"
                type="number"
                min="0"
                placeholder="e.g. 30"
                value={state.transitKm}
                onChange={handleNumberChange("transitKm")}
                className="premium-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label
                  htmlFor="short_flights"
                  className="mb-1.5 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  Short-haul flights/yr
                </label>
                <input
                  id="short_flights"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={state.shortFlights}
                  onChange={handleNumberChange("shortFlights")}
                  className="premium-input"
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="long_flights"
                  className="mb-1.5 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  Long-haul flights/yr
                </label>
                <input
                  id="long_flights"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={state.longFlights}
                  onChange={handleNumberChange("longFlights")}
                  className="premium-input"
                />
              </div>
            </div>
          </fieldset>
        )}

        {/* ── Step 2: Home Energy ─────────────────────── */}
        {state.step === 2 && (
          <fieldset className="animate-fade-in space-y-5">
            <legend className="mb-5 text-xl font-bold text-slate-800 dark:text-slate-100">
              🏠 Home Energy
            </legend>

            <div className="flex flex-col">
              <label
                htmlFor="elec_kwh"
                className="mb-1.5 text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                Electricity per month (kWh)
              </label>
              <input
                id="elec_kwh"
                type="number"
                min="0"
                placeholder="e.g. 300"
                value={state.electricityKwh}
                onChange={handleNumberChange("electricityKwh")}
                className="premium-input"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="gas_kwh"
                className="mb-1.5 text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                Natural gas per month (kWh)
              </label>
              <input
                id="gas_kwh"
                type="number"
                min="0"
                placeholder="e.g. 150"
                value={state.gasKwh}
                onChange={handleNumberChange("gasKwh")}
                className="premium-input"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="household"
                className="mb-1.5 text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                People in household
              </label>
              <input
                id="household"
                type="number"
                min="1"
                max="50"
                value={state.householdSize}
                onChange={handleNumberChange("householdSize")}
                className="premium-input"
              />
            </div>
          </fieldset>
        )}

        {/* ── Step 3: Diet ────────────────────────────── */}
        {state.step === 3 && (
          <fieldset className="animate-fade-in space-y-5">
            <legend className="mb-5 text-xl font-bold text-slate-800 dark:text-slate-100">
              🥗 Diet
            </legend>
            <div className="flex flex-col space-y-2.5">
              {DIET_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all duration-300 ${
                    state.diet === opt.value
                      ? "border-emerald-400 bg-emerald-50/60 shadow-sm shadow-emerald-500/10 dark:bg-emerald-900/20"
                      : "border-slate-200/60 hover:border-emerald-300/60 hover:bg-emerald-50/30 dark:border-slate-700/60 dark:hover:bg-emerald-900/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="diet"
                    value={opt.value}
                    checked={state.diet === opt.value}
                    onChange={handleStringChange("diet")}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-lg">{opt.icon}</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {/* ── Step 4: Consumption ─────────────────────── */}
        {state.step === 4 && (
          <fieldset className="animate-fade-in space-y-5">
            <legend className="mb-5 text-xl font-bold text-slate-800 dark:text-slate-100">
              🛍️ Consumption & Waste
            </legend>

            <div className="flex flex-col">
              <label
                htmlFor="goods_spend"
                className="mb-1.5 text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                Goods spending per month (USD)
              </label>
              <input
                id="goods_spend"
                type="number"
                min="0"
                placeholder="e.g. 200"
                value={state.goodsSpend}
                onChange={handleNumberChange("goodsSpend")}
                className="premium-input"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="waste_kg"
                className="mb-1.5 text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                Waste per week (kg)
              </label>
              <input
                id="waste_kg"
                type="number"
                min="0"
                placeholder="e.g. 5"
                value={state.wasteKg}
                onChange={handleNumberChange("wasteKg")}
                className="premium-input"
              />
            </div>
          </fieldset>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between border-t border-slate-200/40 pt-6 dark:border-slate-700/40">
        <button
          type="button"
          onClick={handlePrev}
          disabled={state.step === FIRST_STEP || state.isSubmitting}
          className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-500 transition-all duration-300 hover:bg-slate-100/60 hover:text-slate-700 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
        >
          ← Back
        </button>

        {state.step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/30 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
          >
            Next →
          </button>
        ) : (
          <button
            type="submit"
            disabled={state.isSubmitting}
            className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/30 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-70"
            style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
          >
            {state.isSubmitting ? "Calculating..." : "Calculate Footprint →"}
          </button>
        )}
      </div>
    </form>
  );
}

export default memo(CarbonForm);
