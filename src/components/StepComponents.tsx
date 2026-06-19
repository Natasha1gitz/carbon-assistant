import React from "react";
import { CARBON_FORM_CONSTANTS } from "@/lib/constants";
import type { FormState } from "@/hooks/useCarbonForm";

export interface StepProps {
  state: FormState;
  handleNumberChange: (
    field: keyof FormState
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStringChange: (
    field: keyof FormState
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

/**
 * Renders the Transport step inputs.
 * @param props - State and change handlers
 * @returns JSX Element
 */
export const TransportStep = (props: StepProps) => {
  const { state, handleNumberChange, handleStringChange } = props;
  return (
    <fieldset className="animate-fade-in space-y-5">
      <legend className="mb-5 text-xl font-bold text-slate-800 dark:text-slate-100">
        {CARBON_FORM_CONSTANTS.TITLES.TRANSPORT}
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
          {CARBON_FORM_CONSTANTS.FUEL_OPTIONS.map((f) => (
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
  );
};

/**
 * Renders the Home Energy step inputs.
 * @param props - Component props.
 */
export const HomeEnergyStep = (props: StepProps) => {
  const { state, handleNumberChange } = props;
  return (
    <fieldset className="animate-fade-in space-y-5">
      <legend className="mb-5 text-xl font-bold text-slate-800 dark:text-slate-100">
        {CARBON_FORM_CONSTANTS.TITLES.HOME}
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
  );
};

/**
 * Renders the Diet step inputs.
 * @param props - Component props.
 */
export const DietStep = (props: StepProps) => {
  const { state, handleStringChange } = props;
  return (
    <fieldset className="animate-fade-in space-y-5">
      <legend className="mb-5 text-xl font-bold text-slate-800 dark:text-slate-100">
        {CARBON_FORM_CONSTANTS.TITLES.DIET}
      </legend>
      <div className="flex flex-col space-y-2.5">
        {CARBON_FORM_CONSTANTS.DIET_OPTIONS.map((opt) => (
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
  );
};

/**
 * Renders the Consumption step inputs.
 * @param props - Component props.
 */
export const ConsumptionStep = (props: StepProps) => {
  const { state, handleNumberChange } = props;
  return (
    <fieldset className="animate-fade-in space-y-5">
      <legend className="mb-5 text-xl font-bold text-slate-800 dark:text-slate-100">
        {CARBON_FORM_CONSTANTS.TITLES.CONSUMPTION}
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
  );
};
