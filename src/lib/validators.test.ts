/**
 * Validation schema tests.
 *
 * Ensures all Zod schemas reject invalid data and accept valid data within
 * documented bounds. Tests cover happy paths, boundary values, negative
 * values, and invalid enum members.
 */
import { describe, it, expect } from "vitest";
import {
  TransportInputSchema,
  HomeInputSchema,
  ConsumptionInputSchema,
  CarbonInputSchema,
  FootprintResultSchema,
  RecommendationSchema,
  InsightsResponseSchema,
} from "./validators";

// ─── TransportInputSchema ──────────────────────────────────────────────

describe("TransportInputSchema", () => {
  it("accepts valid defaults", () => {
    const result = TransportInputSchema.parse({});
    expect(result.car_km_per_week).toBe(0);
    expect(result.car_fuel).toBe("petrol");
    expect(result.public_transit_km_per_week).toBe(0);
    expect(result.short_haul_flights_per_year).toBe(0);
    expect(result.long_haul_flights_per_year).toBe(0);
  });

  it("accepts valid custom values", () => {
    const result = TransportInputSchema.parse({
      car_km_per_week: 150,
      car_fuel: "electric",
      public_transit_km_per_week: 50,
      short_haul_flights_per_year: 4,
      long_haul_flights_per_year: 2,
    });
    expect(result.car_km_per_week).toBe(150);
    expect(result.car_fuel).toBe("electric");
  });

  it("rejects negative car_km_per_week", () => {
    expect(() => TransportInputSchema.parse({ car_km_per_week: -1 })).toThrow();
  });

  it("rejects car_km_per_week exceeding 20000", () => {
    expect(() => TransportInputSchema.parse({ car_km_per_week: 20001 })).toThrow();
  });

  it("rejects unknown car fuel type", () => {
    expect(() => TransportInputSchema.parse({ car_fuel: "hydrogen" })).toThrow();
  });

  it("rejects fractional flight counts", () => {
    expect(() =>
      TransportInputSchema.parse({ short_haul_flights_per_year: 1.5 })
    ).toThrow();
  });

  it("rejects flights exceeding max bound", () => {
    expect(() =>
      TransportInputSchema.parse({ short_haul_flights_per_year: 201 })
    ).toThrow();
  });

  it("accepts all four fuel types", () => {
    for (const fuel of ["petrol", "diesel", "hybrid", "electric"]) {
      const result = TransportInputSchema.parse({ car_fuel: fuel });
      expect(result.car_fuel).toBe(fuel);
    }
  });
});

// ─── HomeInputSchema ───────────────────────────────────────────────────

describe("HomeInputSchema", () => {
  it("accepts valid defaults", () => {
    const result = HomeInputSchema.parse({});
    expect(result.electricity_kwh_per_month).toBe(0);
    expect(result.natural_gas_kwh_per_month).toBe(0);
    expect(result.household_size).toBe(1);
  });

  it("rejects negative electricity", () => {
    expect(() => HomeInputSchema.parse({ electricity_kwh_per_month: -10 })).toThrow();
  });

  it("rejects household_size of 0", () => {
    expect(() => HomeInputSchema.parse({ household_size: 0 })).toThrow();
  });

  it("rejects household_size exceeding 50", () => {
    expect(() => HomeInputSchema.parse({ household_size: 51 })).toThrow();
  });

  it("accepts boundary value of 100000 kWh", () => {
    const result = HomeInputSchema.parse({
      electricity_kwh_per_month: 100000,
    });
    expect(result.electricity_kwh_per_month).toBe(100000);
  });
});

// ─── ConsumptionInputSchema ────────────────────────────────────────────

describe("ConsumptionInputSchema", () => {
  it("accepts valid defaults", () => {
    const result = ConsumptionInputSchema.parse({});
    expect(result.goods_spend_usd_per_month).toBe(0);
    expect(result.waste_kg_per_week).toBe(0);
  });

  it("rejects negative spending", () => {
    expect(() =>
      ConsumptionInputSchema.parse({ goods_spend_usd_per_month: -100 })
    ).toThrow();
  });

  it("rejects waste exceeding max bound", () => {
    expect(() => ConsumptionInputSchema.parse({ waste_kg_per_week: 1001 })).toThrow();
  });
});

// ─── CarbonInputSchema (full input) ────────────────────────────────────

describe("CarbonInputSchema", () => {
  it("accepts empty object with all defaults", () => {
    const result = CarbonInputSchema.parse({});
    expect(result.diet).toBe("medium_meat");
    expect(result.transport.car_fuel).toBe("petrol");
    expect(result.home.household_size).toBe(1);
    expect(result.consumption.goods_spend_usd_per_month).toBe(0);
  });

  it("accepts all six diet types", () => {
    const diets = [
      "heavy_meat",
      "medium_meat",
      "low_meat",
      "pescatarian",
      "vegetarian",
      "vegan",
    ] as const;
    for (const diet of diets) {
      const result = CarbonInputSchema.parse({ diet });
      expect(result.diet).toBe(diet);
    }
  });

  it("rejects invalid diet type", () => {
    expect(() => CarbonInputSchema.parse({ diet: "carnivore_supreme" })).toThrow();
  });

  it("accepts a fully-specified input", () => {
    const result = CarbonInputSchema.parse({
      transport: {
        car_km_per_week: 100,
        car_fuel: "diesel",
        public_transit_km_per_week: 25,
        short_haul_flights_per_year: 3,
        long_haul_flights_per_year: 1,
      },
      home: {
        electricity_kwh_per_month: 400,
        natural_gas_kwh_per_month: 200,
        household_size: 3,
      },
      diet: "vegetarian",
      consumption: {
        goods_spend_usd_per_month: 300,
        waste_kg_per_week: 5,
      },
    });
    expect(result.transport.car_fuel).toBe("diesel");
    expect(result.home.household_size).toBe(3);
    expect(result.diet).toBe("vegetarian");
    expect(result.consumption.goods_spend_usd_per_month).toBe(300);
  });
});

// ─── Output schemas ────────────────────────────────────────────────────

describe("FootprintResultSchema", () => {
  it("accepts a valid footprint result", () => {
    const result = FootprintResultSchema.parse({
      breakdown_kg: { transport: 1000, home: 500, diet: 2500, consumption: 800 },
      total_annual_kg: 4800,
      total_annual_tonnes: 4.8,
      comparison: {
        global_average_annual_kg: 4800,
        sustainable_target_annual_kg: 2000,
        ratio_to_global_average: 1.0,
        ratio_to_sustainable_target: 2.4,
      },
    });
    expect(result.total_annual_kg).toBe(4800);
  });
});

describe("RecommendationSchema", () => {
  it("accepts a valid recommendation", () => {
    const result = RecommendationSchema.parse({
      category: "transport",
      action: "Use public transit more",
      estimated_annual_savings_kg: 500,
    });
    expect(result.category).toBe("transport");
  });
});

describe("InsightsResponseSchema", () => {
  it("accepts a valid insights response", () => {
    const result = InsightsResponseSchema.parse({
      summary: "Your footprint is above target.",
      recommendations: [
        {
          category: "diet",
          action: "Eat less meat",
          estimated_annual_savings_kg: 800,
        },
      ],
      source: "rules",
    });
    expect(result.source).toBe("rules");
    expect(result.recommendations).toHaveLength(1);
  });
});
