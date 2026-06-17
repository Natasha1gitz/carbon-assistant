/**
 * Unit tests for the rule-based insight engine.
 */
import { describe, it, expect } from "vitest";
import { generateRuleBasedInsights } from "./rules";
import { calculateFootprint } from "./calculator";
import type { CarbonInput } from "./validators";

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

describe("Rule-based Insights", () => {
  it("returns source as rules", () => {
    const input = makeInput();
    const result = calculateFootprint(input);
    const insights = generateRuleBasedInsights(input, result);
    expect(insights.source).toBe("rules");
  });

  it("returns at most 4 recommendations", () => {
    const input = makeInput({
      transport: { ...makeInput().transport, car_km_per_week: 200 },
      home: {
        electricity_kwh_per_month: 500,
        natural_gas_kwh_per_month: 200,
        household_size: 1,
      },
      diet: "heavy_meat",
      consumption: { goods_spend_usd_per_month: 500, waste_kg_per_week: 10 },
    });
    const result = calculateFootprint(input);
    const insights = generateRuleBasedInsights(input, result);
    expect(insights.recommendations.length).toBeLessThanOrEqual(4);
    expect(insights.recommendations.length).toBeGreaterThanOrEqual(1);
  });

  it("recommends EV switch for petrol drivers", () => {
    const input = makeInput({
      transport: { ...makeInput().transport, car_km_per_week: 200, car_fuel: "petrol" },
    });
    const result = calculateFootprint(input);
    const insights = generateRuleBasedInsights(input, result);
    const transportRec = insights.recommendations.find((r) => r.category === "transport");
    expect(transportRec).toBeDefined();
    expect(transportRec!.estimated_annual_savings_kg).toBeGreaterThan(0);
  });

  it("recommends diet step-down for heavy meat eaters", () => {
    const input = makeInput({ diet: "heavy_meat" });
    const result = calculateFootprint(input);
    const insights = generateRuleBasedInsights(input, result);
    const dietRec = insights.recommendations.find((r) => r.category === "diet");
    expect(dietRec).toBeDefined();
    expect(dietRec!.action).toContain("medium meat");
  });

  it("does not recommend diet change for vegans", () => {
    const input = makeInput({ diet: "vegan" });
    const result = calculateFootprint(input);
    const insights = generateRuleBasedInsights(input, result);
    const dietRec = insights.recommendations.find((r) => r.category === "diet");
    expect(dietRec).toBeUndefined();
  });

  it("recommends reducing flights if flight emissions exceed car emissions", () => {
    const input = makeInput({
      transport: { ...makeInput().transport, long_haul_flights_per_year: 5 },
    });
    const result = calculateFootprint(input);
    const insights = generateRuleBasedInsights(input, result);
    const transportRec = insights.recommendations.find((r) => r.category === "transport");
    expect(transportRec).toBeDefined();
    expect(transportRec!.action).toContain("Replace one or more flights");
  });

  it("recommends generic transport reduction if car is electric and flights are 0", () => {
    const input = makeInput({
      transport: { ...makeInput().transport, car_km_per_week: 100, car_fuel: "electric" },
    });
    const result = calculateFootprint(input);
    const insights = generateRuleBasedInsights(input, result);
    const transportRec = insights.recommendations.find((r) => r.category === "transport");
    expect(transportRec).toBeDefined();
    expect(transportRec!.action).toContain("Carpool or use public transit");
  });

  it("congratulates users at or below sustainable target", () => {
    const input = makeInput({ diet: "vegan" });
    const result = calculateFootprint(input);
    const insights = generateRuleBasedInsights(input, result);
    expect(insights.summary).toContain("at or below");
  });
});
