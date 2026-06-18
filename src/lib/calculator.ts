/**
 * The carbon footprint calculation engine.
 *
 * Pure, deterministic, side-effect-free functions: the same input always yields
 * the same output, with no I/O. This makes the engine trivially unit-testable
 * and lets the UI compute results without touching a database or external service.
 *
 * All quantities are normalised to **annual kg CO2e** before being summed.
 */
import type {
  CarbonInput,
  TransportInput,
  HomeInput,
  ConsumptionInput,
  FootprintResult,
  Comparison,
} from "./validators";
import * as F from "./factors";
import { round } from "./utils";

/**
 * Annual transport emissions from car, transit, and flights.
 * @param t - The user's transport input data.
 */
function transportAnnualKg(t: TransportInput): number {
  const car = t.car_km_per_week * F.WEEKS_PER_YEAR * F.CAR_FACTORS_PER_KM[t.car_fuel];
  const transit =
    t.public_transit_km_per_week * F.WEEKS_PER_YEAR * F.PUBLIC_TRANSIT_PER_KM;
  const flights =
    t.short_haul_flights_per_year * F.SHORT_HAUL_TRIP_KM * F.FLIGHT_SHORT_HAUL_PER_KM +
    t.long_haul_flights_per_year * F.LONG_HAUL_TRIP_KM * F.FLIGHT_LONG_HAUL_PER_KM;
  return car + transit + flights;
}

/**
 * Annual home energy emissions, split per-person in the household.
 * @param h - The user's home energy input data.
 */
function homeAnnualKg(h: HomeInput): number {
  const electricity =
    h.electricity_kwh_per_month * F.MONTHS_PER_YEAR * F.ELECTRICITY_PER_KWH;
  const gas = h.natural_gas_kwh_per_month * F.MONTHS_PER_YEAR * F.NATURAL_GAS_PER_KWH;
  return (electricity + gas) / h.household_size;
}

/**
 * Annual consumption emissions from goods spending and waste.
 * @param c - The user's consumption input data.
 */
function consumptionAnnualKg(c: ConsumptionInput): number {
  const goods = c.goods_spend_usd_per_month * F.MONTHS_PER_YEAR * F.GOODS_PER_USD_MONTHLY;
  const waste = c.waste_kg_per_week * F.WEEKS_PER_YEAR * F.WASTE_PER_KG;
  return goods + waste;
}

/**
 * Compute the annual carbon footprint breakdown for a set of inputs.
 * @param data - Validated carbon input from the form.
 */
export function calculateFootprint(data: Readonly<CarbonInput>): FootprintResult {
  const breakdown: Record<string, number> = {
    transport: round(transportAnnualKg(data.transport)),
    home: round(homeAnnualKg(data.home)),
    diet: round(F.DIET_ANNUAL_KG[data.diet]),
    consumption: round(consumptionAnnualKg(data.consumption)),
  };

  const total = round(Object.values(breakdown).reduce((a, b) => a + b, 0));

  const comparison: Comparison = {
    global_average_annual_kg: F.GLOBAL_AVG_ANNUAL_KG,
    sustainable_target_annual_kg: F.SUSTAINABLE_TARGET_ANNUAL_KG,
    ratio_to_global_average: round(total / F.GLOBAL_AVG_ANNUAL_KG, 3),
    ratio_to_sustainable_target: round(total / F.SUSTAINABLE_TARGET_ANNUAL_KG, 3),
  };

  return {
    breakdown_kg: breakdown,
    total_annual_kg: total,
    total_annual_tonnes: round(total / 1000, 3),
    comparison,
  };
}
