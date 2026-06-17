/**
 * Zod validation schemas — the validated contract for all data flowing
 * through the application.
 *
 * These models serve as both input validation (rejecting nonsensical values
 * before any computation) and as the TypeScript type surface. Keeping every
 * field bounded is a deliberate security measure: clients cannot submit
 * unbounded or negative quantities.
 */
import { z } from "zod";

// Generous-but-finite upper bounds keep inputs sane without rejecting real users.
const MAX_KM_WEEK = 20_000;
const MAX_KWH_MONTH = 100_000;
const MAX_FLIGHTS = 200;
const MAX_USD_MONTH = 1_000_000;
const MAX_WASTE_WEEK = 1_000;

/** Weekly travel habits plus yearly flight counts. */
export const TransportInputSchema = z.object({
  car_km_per_week: z.number().min(0).max(MAX_KM_WEEK).default(0),
  car_fuel: z.enum(["petrol", "diesel", "hybrid", "electric"]).default("petrol"),
  public_transit_km_per_week: z.number().min(0).max(MAX_KM_WEEK).default(0),
  short_haul_flights_per_year: z.number().int().min(0).max(MAX_FLIGHTS).default(0),
  long_haul_flights_per_year: z.number().int().min(0).max(MAX_FLIGHTS).default(0),
});

/** Monthly household energy use, shared across the household size. */
export const HomeInputSchema = z.object({
  electricity_kwh_per_month: z.number().min(0).max(MAX_KWH_MONTH).default(0),
  natural_gas_kwh_per_month: z.number().min(0).max(MAX_KWH_MONTH).default(0),
  household_size: z.number().int().min(1).max(50).default(1),
});

/** Consumer goods spending and landfill waste. */
export const ConsumptionInputSchema = z.object({
  goods_spend_usd_per_month: z.number().min(0).max(MAX_USD_MONTH).default(0),
  waste_kg_per_week: z.number().min(0).max(MAX_WASTE_WEEK).default(0),
});

/** Full set of lifestyle inputs for a footprint estimate. */
export const CarbonInputSchema = z.object({
  transport: TransportInputSchema.default({
    car_km_per_week: 0,
    car_fuel: "petrol",
    public_transit_km_per_week: 0,
    short_haul_flights_per_year: 0,
    long_haul_flights_per_year: 0,
  }),
  home: HomeInputSchema.default({
    electricity_kwh_per_month: 0,
    natural_gas_kwh_per_month: 0,
    household_size: 1,
  }),
  diet: z
    .enum(["heavy_meat", "medium_meat", "low_meat", "pescatarian", "vegetarian", "vegan"])
    .default("medium_meat"),
  consumption: ConsumptionInputSchema.default({
    goods_spend_usd_per_month: 0,
    waste_kg_per_week: 0,
  }),
});

export type TransportInput = z.infer<typeof TransportInputSchema>;
export type HomeInput = z.infer<typeof HomeInputSchema>;
export type ConsumptionInput = z.infer<typeof ConsumptionInputSchema>;
export type CarbonInput = z.infer<typeof CarbonInputSchema>;

/** The user's total in context: global average and sustainable target. */
const ComparisonSchema = z.object({
  global_average_annual_kg: z.number(),
  sustainable_target_annual_kg: z.number(),
  ratio_to_global_average: z.number(),
  ratio_to_sustainable_target: z.number(),
});

export type Comparison = z.infer<typeof ComparisonSchema>;

/** Per-category annual breakdown (kg CO2e) plus totals and context. */
export const FootprintResultSchema = z.object({
  breakdown_kg: z.record(z.string(), z.number()),
  total_annual_kg: z.number(),
  total_annual_tonnes: z.number(),
  comparison: ComparisonSchema,
});

export type FootprintResult = z.infer<typeof FootprintResultSchema>;

/** One concrete reduction action with a quantified annual saving. */
export const RecommendationSchema = z.object({
  category: z.string(),
  action: z.string(),
  estimated_annual_savings_kg: z.number(),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

/** Personalized advice: a summary plus ranked recommendations. */
export const InsightsResponseSchema = z.object({
  summary: z.string(),
  recommendations: z.array(RecommendationSchema),
  source: z.string(), // "gemini" | "rules"
});

export type InsightsResponse = z.infer<typeof InsightsResponseSchema>;
