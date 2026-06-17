/// <reference types="vitest-axe/matchers" />
import React from "react";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, it, expect } from "vitest";
import HistoryPanel from "./HistoryPanel";
import type { FootprintResult } from "@/lib/validators";

const mockResult: FootprintResult = {
  breakdown_kg: {
    transport: 1500,
    home: 800,
    diet: 2500,
    consumption: 1000,
  },
  total_annual_kg: 5800,
  total_annual_tonnes: 5.8,
  comparison: {
    global_average_annual_kg: 4800,
    sustainable_target_annual_kg: 2000,
    ratio_to_global_average: 1.208,
    ratio_to_sustainable_target: 2.9,
  },
};

const mockEntries = [
  {
    id: "entry-1",
    created_at: "2024-01-15T10:00:00Z",
    result: mockResult,
  },
  {
    id: "entry-2",
    created_at: "2024-02-20T14:30:00Z",
    result: {
      ...mockResult,
      total_annual_tonnes: 4.2,
      total_annual_kg: 4200,
      comparison: {
        ...mockResult.comparison,
        ratio_to_sustainable_target: 2.1,
      },
    },
  },
];

describe("HistoryPanel", () => {
  it("should not have any accessibility violations with entries", async () => {
    const { container } = render(<HistoryPanel entries={mockEntries} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should not have any accessibility violations when empty", async () => {
    const { container } = render(<HistoryPanel entries={[]} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders empty state message when no entries", () => {
    render(<HistoryPanel entries={[]} />);
    expect(screen.getByText(/No previous calculations yet/i)).toBeTruthy();
  });

  it("renders heading", () => {
    render(<HistoryPanel entries={mockEntries} />);
    expect(screen.getByRole("heading", { name: /Footprint History/i })).toBeTruthy();
  });

  it("renders table headers", () => {
    render(<HistoryPanel entries={mockEntries} />);
    expect(screen.getByText("Date")).toBeTruthy();
    expect(screen.getByText("Total")).toBeTruthy();
    expect(screen.getByText("Transport")).toBeTruthy();
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Diet")).toBeTruthy();
    expect(screen.getByText("Consumption")).toBeTruthy();
  });

  it("renders correct number of data rows", () => {
    render(<HistoryPanel entries={mockEntries} />);
    // 2 entries → 2 data rows
    const rows = screen.getAllByRole("row");
    // header row + 2 data rows = 3
    expect(rows.length).toBe(3);
  });

  it("displays total tonnes for each entry", () => {
    render(<HistoryPanel entries={mockEntries} />);
    expect(screen.getByText("5.8 t")).toBeTruthy();
    expect(screen.getByText("4.2 t")).toBeTruthy();
  });

  it("displays ratio badges", () => {
    render(<HistoryPanel entries={mockEntries} />);
    expect(screen.getByText("2.9×")).toBeTruthy();
    expect(screen.getByText("2.1×")).toBeTruthy();
  });
});
