/**
 * Unit tests for the pure carbon calculation engine.
 *
 * Validates that every sub-calculator produces correct annual kg CO2e figures
 * based on the documented emission factors.
 */
import { describe, it, expect } from "vitest";
import { calculateFootprint } from "./calculator";
import * as F from "./factors";
import type { CarbonInput } from "./validators";

/** Helper to build a CarbonInput with defaults. */
function makeInput(overrides: Partial<CarbonInput> = {}): CarbonInput {
  return {
    transport: {
      car_km_per_week: 0,
      car_fuel: "petrol",
      public_transit_km_per_week: 0,
      short_haul_flights_per_year: 0,
      long_haul_flights_per_year: 0,
    },
    home: {
      electricity_kwh_per_month: 0,
      natural_gas_kwh_per_month: 0,
      household_size: 1,
    },
    diet: "medium_meat",
    consumption: {
      goods_spend_usd_per_month: 0,
      waste_kg_per_week: 0,
    },
    ...overrides,
  };
}

describe("Carbon Calculator", () => {
  it("empty input produces diet-only footprint", () => {
    const result = calculateFootprint(makeInput({ diet: "vegan" }));

    expect(result.breakdown_kg.transport).toBe(0);
    expect(result.breakdown_kg.home).toBe(0);
    expect(result.breakdown_kg.consumption).toBe(0);
    expect(result.breakdown_kg.diet).toBeCloseTo(F.DIET_ANNUAL_KG.vegan);
    expect(result.total_annual_kg).toBeCloseTo(F.DIET_ANNUAL_KG.vegan);
  });

  it("car emissions annualized by fuel type", () => {
    const result = calculateFootprint(
      makeInput({
        transport: {
          car_km_per_week: 100,
          car_fuel: "petrol",
          public_transit_km_per_week: 0,
          short_haul_flights_per_year: 0,
          long_haul_flights_per_year: 0,
        },
        diet: "vegan",
      })
    );
    const expected = 100 * 52 * F.CAR_FACTORS_PER_KM.petrol;
    expect(result.breakdown_kg.transport).toBeCloseTo(expected);
  });

  it("electric car lower emissions than petrol", () => {
    const petrol = calculateFootprint(
      makeInput({
        transport: { ...makeInput().transport, car_km_per_week: 100, car_fuel: "petrol" },
      })
    );
    const electric = calculateFootprint(
      makeInput({
        transport: {
          ...makeInput().transport,
          car_km_per_week: 100,
          car_fuel: "electric",
        },
      })
    );
    expect(electric.breakdown_kg.transport!).toBeLessThan(petrol.breakdown_kg.transport!);
  });

  it("flights use representative distances", () => {
    const result = calculateFootprint(
      makeInput({
        transport: {
          ...makeInput().transport,
          short_haul_flights_per_year: 2,
          long_haul_flights_per_year: 1,
        },
        diet: "vegan",
      })
    );
    const expected =
      2 * F.SHORT_HAUL_TRIP_KM * F.FLIGHT_SHORT_HAUL_PER_KM +
      1 * F.LONG_HAUL_TRIP_KM * F.FLIGHT_LONG_HAUL_PER_KM;
    expect(result.breakdown_kg.transport).toBeCloseTo(expected);
  });

  it("home energy split by household size", () => {
    const solo = calculateFootprint(
      makeInput({
        home: {
          electricity_kwh_per_month: 300,
          natural_gas_kwh_per_month: 0,
          household_size: 1,
        },
      })
    );
    const shared = calculateFootprint(
      makeInput({
        home: {
          electricity_kwh_per_month: 300,
          natural_gas_kwh_per_month: 0,
          household_size: 3,
        },
      })
    );
    expect(shared.breakdown_kg.home!).toBeCloseTo(solo.breakdown_kg.home! / 3);
  });

  it("consumption combines goods and waste", () => {
    const result = calculateFootprint(
      makeInput({
        consumption: { goods_spend_usd_per_month: 200, waste_kg_per_week: 5 },
        diet: "vegan",
      })
    );
    const expected = 200 * 12 * F.GOODS_PER_USD_MONTHLY + 5 * 52 * F.WASTE_PER_KG;
    expect(result.breakdown_kg.consumption).toBeCloseTo(expected);
  });

  it("total is the sum of all categories", () => {
    const result = calculateFootprint(
      makeInput({
        transport: { ...makeInput().transport, car_km_per_week: 50 },
        home: {
          electricity_kwh_per_month: 100,
          natural_gas_kwh_per_month: 50,
          household_size: 2,
        },
        diet: "heavy_meat",
        consumption: { goods_spend_usd_per_month: 100, waste_kg_per_week: 3 },
      })
    );
    const sum = Object.values(result.breakdown_kg).reduce((a, b) => a + b, 0);
    expect(result.total_annual_kg).toBeCloseTo(sum);
  });

  it("comparison ratios are correct", () => {
    const result = calculateFootprint(makeInput({ diet: "vegan" }));
    expect(result.comparison.global_average_annual_kg).toBe(F.GLOBAL_AVG_ANNUAL_KG);
    expect(result.comparison.ratio_to_global_average).toBeCloseTo(
      result.total_annual_kg / F.GLOBAL_AVG_ANNUAL_KG,
      2
    );
  });

  it("total_annual_tonnes is total / 1000", () => {
    const result = calculateFootprint(makeInput({ diet: "heavy_meat" }));
    expect(result.total_annual_tonnes).toBeCloseTo(result.total_annual_kg / 1000, 2);
  });
});
