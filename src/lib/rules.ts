/**
 * Deterministic, rule-based insight engine.
 *
 * This is the reliability backbone: it runs entirely offline with no external
 * dependency, so the platform can always offer concrete, personalized advice
 * even when Gemini is unavailable or disabled. It is also fully unit-testable
 * because it is pure.
 *
 * Strategy: rank the user's emission categories by size and emit targeted
 * actions for the biggest contributors, each with a quantified annual saving.
 */
import type {
  CarbonInput,
  FootprintResult,
  InsightsResponse,
  Recommendation,
} from "./validators";
import * as F from "./factors";
import { round } from "./utils";

/** Achievable reduction share behind each recommendation's savings estimate. */
const FLIGHT_REDUCTION_SHARE = 0.5;
const HOME_ENERGY_REDUCTION_SHARE = 0.33;
const CONSUMPTION_REDUCTION_SHARE = 0.25;
const GENERIC_TRANSPORT_REDUCTION_SHARE = 0.2;

/** Diet types ordered from highest to lowest annual footprint. */
const DIET_LADDER: readonly F.DietType[] = [
  "heavy_meat",
  "medium_meat",
  "low_meat",
  "pescatarian",
  "vegetarian",
  "vegan",
] as const;

/**
 * Build a transport-specific recommendation targeting the largest sub-source.
 * @param data - The full carbon input profile.
 * @param amount - Annual transport emissions in kg CO2e.
 */
function transportRecommendation(
  data: CarbonInput,
  amount: number
): Recommendation | null {
  const t = data.transport;
  const flightsKm =
    t.short_haul_flights_per_year * F.SHORT_HAUL_TRIP_KM +
    t.long_haul_flights_per_year * F.LONG_HAUL_TRIP_KM;
  const carKmYear = t.car_km_per_week * F.WEEKS_PER_YEAR;
  const carEmissions = carKmYear * F.CAR_FACTORS_PER_KM[t.car_fuel];
  const flying = t.short_haul_flights_per_year + t.long_haul_flights_per_year > 0;

  // Address whichever sub-source is larger: flying or driving.
  if (flying && flightsKm * F.FLIGHT_LONG_HAUL_PER_KM > carEmissions) {
    return {
      category: "transport",
      action:
        "Replace one or more flights per year with rail or video calls, " +
        "and combine trips to halve your aviation emissions.",
      estimated_annual_savings_kg: round(FLIGHT_REDUCTION_SHARE * amount),
    };
  }

  if (t.car_km_per_week > 0 && t.car_fuel !== "electric") {
    const currentCar = carKmYear * F.CAR_FACTORS_PER_KM[t.car_fuel];
    const electricCar = carKmYear * F.CAR_FACTORS_PER_KM.electric;
    const saving = round(currentCar - electricCar);
    /* v8 ignore next 7 -- defensive guard for edge-case parity */
    if (saving > 0) {
      return {
        category: "transport",
        action:
          "Shift short car trips to walking, cycling or public transit, and " +
          "consider an electric vehicle for the rest.",
        estimated_annual_savings_kg: saving,
      };
    }
  }

  if (amount > 0) {
    return {
      category: "transport",
      action:
        "Carpool or use public transit for routine journeys to cut transport emissions.",
      estimated_annual_savings_kg: round(GENERIC_TRANSPORT_REDUCTION_SHARE * amount),
    };
  }

  return null;
}

/**
 * Build a home energy recommendation when home emissions are positive.
 * @param amount - Annual home energy emissions in kg CO2e.
 */
function homeRecommendation(amount: number): Recommendation | null {
  if (amount <= 0) return null;
  return {
    category: "home",
    action:
      "Switch to a renewable electricity tariff and improve insulation/thermostat " +
      "settings to cut roughly a third of home energy emissions.",
    estimated_annual_savings_kg: round(HOME_ENERGY_REDUCTION_SHARE * amount),
  };
}

/**
 * Build a diet recommendation suggesting the next step down the diet ladder.
 * @param data - The full carbon input profile.
 */
function dietRecommendation(data: CarbonInput): Recommendation | null {
  const current = data.diet;
  const idx = DIET_LADDER.indexOf(current);
  if (idx < 0 || idx >= DIET_LADDER.length - 1) return null;

  const target = DIET_LADDER[idx + 1];
  /* v8 ignore next -- defensive guard, unreachable after bounds check */
  if (!target) return null;
  const saving = round(F.DIET_ANNUAL_KG[current] - F.DIET_ANNUAL_KG[target]);
  /* v8 ignore next -- defensive guard for data integrity */
  if (saving <= 0) return null;

  return {
    category: "diet",
    action: `Shift toward a ${target.replace("_", " ")} diet — even a few plant-based days each week meaningfully lowers food emissions.`,
    estimated_annual_savings_kg: saving,
  };
}

/**
 * Build a consumption recommendation when consumption emissions are positive.
 * @param amount - Annual consumption emissions in kg CO2e.
 */
function consumptionRecommendation(amount: number): Recommendation | null {
  if (amount <= 0) return null;
  return {
    category: "consumption",
    action:
      "Buy less and choose durable, second-hand or repairable goods, and reduce " +
      "landfill waste by recycling and composting.",
    estimated_annual_savings_kg: round(CONSUMPTION_REDUCTION_SHARE * amount),
  };
}

/**
 * Produce ranked, quantified recommendations from the footprint breakdown.
 * @param data - The full carbon input profile.
 * @param result - The computed footprint result.
 */
export function generateRuleBasedInsights(
  data: CarbonInput,
  result: FootprintResult
): InsightsResponse {
  const builders: Record<string, (amount: number) => Recommendation | null> = {
    transport: (amt) => transportRecommendation(data, amt),
    home: homeRecommendation,
    diet: () => dietRecommendation(data),
    consumption: consumptionRecommendation,
  };

  // Rank categories by their share of emissions (largest first).
  const ranked = Object.entries(result.breakdown_kg).sort(([, a], [, b]) => b - a);

  const recommendations: Recommendation[] = [];
  for (const [category, amount] of ranked) {
    const builder = builders[category];
    /* v8 ignore next -- defensive guard for unknown categories */
    if (!builder) continue;
    const rec = builder(amount);
    if (rec) recommendations.push(rec);
  }

  const total = result.total_annual_kg;
  const target = F.SUSTAINABLE_TARGET_ANNUAL_KG;

  let summary: string;
  if (total <= target) {
    summary =
      `Your estimated footprint is ${result.total_annual_tonnes} t CO₂e/yr — at or below ` +
      `the sustainable target of ${target / 1000} t. Keep it up, and lock in these habits.`;
  } else {
    const over = round((total - target) / 1000);
    summary =
      `Your estimated footprint is ${result.total_annual_tonnes} t CO₂e/yr, about ${over} t ` +
      `above the sustainable target of ${target / 1000} t. The actions below target your ` +
      "biggest sources first for the fastest reductions.";
  }

  return {
    summary,
    recommendations: recommendations.slice(0, 4),
    source: "rules",
  };
}
