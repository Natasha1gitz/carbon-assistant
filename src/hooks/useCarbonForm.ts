import { useReducer, useCallback } from "react";
import { CarbonInputSchema } from "@/lib/validators";
import type { CarbonInput } from "@/lib/validators";

/**
 * Interface defining the exact shape of the form state.
 * @remarks Explicit types ensure strict compliance with TypeScript rules.
 */
export interface FormState {
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

/**
 * Custom hook to encapsulate CarbonForm state and validation logic.
 * @remarks
 * Decouples state logic from the UI to drop Cognitive Complexity (Rule S3776) to 0.
 * @param onSubmit - Callback fired when valid data is submitted.
 * @returns State, dispatch functions, and standard React event handlers.
 * @example
 * ```tsx
 * const { state, handleNext, handlePrev } = useCarbonForm((data) => submit(data));
 * ```
 */
export function useCarbonForm(onSubmit: (data: CarbonInput) => void) {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const handleNext = useCallback(() => {
    dispatch({ type: "SET_STEP", step: Math.min(state.step + 1, 4) });
  }, [state.step]);

  const handlePrev = useCallback(() => {
    dispatch({ type: "SET_STEP", step: Math.max(state.step - 1, 1) });
  }, [state.step]);

  const setStep = useCallback((step: number) => {
    dispatch({ type: "SET_STEP", step });
  }, []);

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

  return {
    state,
    handleNext,
    handlePrev,
    setStep,
    handleNumberChange,
    handleStringChange,
    handleSubmit,
  };
}
