import { describe, it, expect } from "vitest";
import { round } from "./utils";

describe("round", () => {
  it("rounds to 2 decimal places by default", () => {
    expect(round(1.2345)).toBe(1.23);
  });

  it("rounds to specified decimal places", () => {
    expect(round(1.2345, 3)).toBe(1.235);
  });

  it("rounds to 0 decimal places", () => {
    expect(round(1.5, 0)).toBe(2);
  });

  it("handles negative numbers", () => {
    expect(round(-1.2345)).toBe(-1.23);
  });

  it("handles zero", () => {
    expect(round(0)).toBe(0);
  });
});
