/// <reference types="vitest-axe/matchers" />
import React from "react";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act } from "@testing-library/react";
import Dashboard from "./Dashboard";
import type { FootprintResult } from "@/lib/validators";

const mockResult: FootprintResult = {
  breakdown_kg: {
    transport: 1500,
    home: 1200,
    diet: 2500,
    consumption: 800,
  },
  total_annual_kg: 6000,
  total_annual_tonnes: 6.0,
  comparison: {
    global_average_annual_kg: 4800,
    sustainable_target_annual_kg: 2000,
    ratio_to_global_average: 1.25,
    ratio_to_sustainable_target: 3.0,
  },
};

describe("Dashboard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = render(<Dashboard result={mockResult} />);
    act(() => {
      vi.advanceTimersByTime(150);
    });
    vi.useRealTimers();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("displays the total in tonnes", () => {
    const { container } = render(<Dashboard result={mockResult} />);
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(container.textContent).toContain("6");
    expect(container.textContent).toContain("t CO₂e / year");
  });
});
