/**
 * Centralized constant strings and configurations to reduce Halstead Volume.
 * @remarks Extracts all hardcoded UI text to satisfy SonarQube S1192 and improve Code Quality.
 */
export const CARBON_FORM_CONSTANTS = {
  STEP_LABELS: [
    { num: 1, icon: "🚗", label: "Transport" },
    { num: 2, icon: "🏠", label: "Home" },
    { num: 3, icon: "🥗", label: "Diet" },
    { num: 4, icon: "🛍️", label: "Consumption" },
  ] as const,
  DIET_OPTIONS: [
    { value: "heavy_meat", label: "Heavy meat eater", icon: "🥩" },
    { value: "medium_meat", label: "Medium meat eater", icon: "🍖" },
    { value: "low_meat", label: "Low meat / flexitarian", icon: "🥘" },
    { value: "pescatarian", label: "Pescatarian", icon: "🐟" },
    { value: "vegetarian", label: "Vegetarian", icon: "🥕" },
    { value: "vegan", label: "Vegan", icon: "🌱" },
  ] as const,
  FUEL_OPTIONS: [
    { value: "petrol", label: "Petrol / Gasoline" },
    { value: "diesel", label: "Diesel" },
    { value: "hybrid", label: "Hybrid" },
    { value: "electric", label: "Electric" },
  ] as const,
  TITLES: {
    TRANSPORT: "🚗 Transport",
    HOME: "🏠 Home Energy",
    DIET: "🥗 Diet",
    CONSUMPTION: "🛍️ Consumption & Waste",
  },
  BUTTONS: {
    BACK: "← Back",
    NEXT: "Next →",
    CALCULATE: "Calculate Footprint →",
    CALCULATING: "Calculating...",
  },
  ACCESSIBILITY: {
    PROGRESS_PREFIX: "Step ",
    PROGRESS_SUFFIX: " of ",
    CALCULATING_ARIA: "Calculating your carbon footprint...",
  },
} as const;
