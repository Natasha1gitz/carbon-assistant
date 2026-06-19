"use client";

import React, { memo } from "react";
import type { CarbonInput } from "@/lib/validators";
import { CARBON_FORM_CONSTANTS } from "@/lib/constants";
import { useCarbonForm } from "@/hooks/useCarbonForm";
import {
  TransportStep,
  HomeEnergyStep,
  DietStep,
  ConsumptionStep,
} from "./StepComponents";

interface CarbonFormProps {
  onSubmit: (data: CarbonInput) => void;
}

/**
 * Main wrapper for the Carbon Form.
 * @remarks Refactored to act purely as a Presenter. State is managed by useCarbonForm.
 * @param props - Form callbacks.
 * @returns React functional component.
 */
function CarbonForm(props: CarbonFormProps) {
  const { onSubmit } = props;
  const {
    state,
    handleNext,
    handlePrev,
    setStep,
    handleNumberChange,
    handleStringChange,
    handleSubmit,
  } = useCarbonForm(onSubmit);

  return (
    <form onSubmit={handleSubmit} className="glass-card mx-auto max-w-xl p-8">
      <div aria-live="polite" className="sr-only">
        {state.isSubmitting
          ? CARBON_FORM_CONSTANTS.ACCESSIBILITY.CALCULATING_ARIA
          : `${CARBON_FORM_CONSTANTS.ACCESSIBILITY.PROGRESS_PREFIX}${state.step}${CARBON_FORM_CONSTANTS.ACCESSIBILITY.PROGRESS_SUFFIX}${CARBON_FORM_CONSTANTS.STEP_LABELS.length}`}
      </div>

      {/* Premium Step Indicator */}
      <div
        className="mb-8 flex items-center justify-between px-2"
        aria-label="Form Progress"
        role="navigation"
      >
        {CARBON_FORM_CONSTANTS.STEP_LABELS.map((s, i) => (
          <React.Fragment key={s.num}>
            <button
              type="button"
              onClick={() => setStep(s.num)}
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
            {i < CARBON_FORM_CONSTANTS.STEP_LABELS.length - 1 && (
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
        {state.step === 1 && (
          <TransportStep
            state={state}
            handleNumberChange={handleNumberChange}
            handleStringChange={handleStringChange}
          />
        )}
        {state.step === 2 && (
          <HomeEnergyStep
            state={state}
            handleNumberChange={handleNumberChange}
            handleStringChange={handleStringChange}
          />
        )}
        {state.step === 3 && (
          <DietStep
            state={state}
            handleNumberChange={handleNumberChange}
            handleStringChange={handleStringChange}
          />
        )}
        {state.step === 4 && (
          <ConsumptionStep
            state={state}
            handleNumberChange={handleNumberChange}
            handleStringChange={handleStringChange}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between border-t border-slate-200/40 pt-6 dark:border-slate-700/40">
        <button
          type="button"
          onClick={handlePrev}
          disabled={state.step === 1 || state.isSubmitting}
          className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-500 transition-all duration-300 hover:bg-slate-100/60 hover:text-slate-700 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
        >
          {CARBON_FORM_CONSTANTS.BUTTONS.BACK}
        </button>

        {state.step < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/30 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
          >
            {CARBON_FORM_CONSTANTS.BUTTONS.NEXT}
          </button>
        ) : (
          <button
            type="submit"
            disabled={state.isSubmitting}
            className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/30 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-70"
            style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
          >
            {state.isSubmitting
              ? CARBON_FORM_CONSTANTS.BUTTONS.CALCULATING
              : CARBON_FORM_CONSTANTS.BUTTONS.CALCULATE}
          </button>
        )}
      </div>
    </form>
  );
}

export default memo(CarbonForm);
