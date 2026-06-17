/// <reference types="vitest-axe/matchers" />
import React from "react";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, it, expect } from "vitest";
import AiAssistant from "./AiAssistant";
import type { InsightsResponse } from "@/lib/validators";

const mockInsights: InsightsResponse = {
  summary: "Your footprint is above the sustainable target.",
  recommendations: [
    {
      category: "transport",
      action: "Switch to public transit for daily commute.",
      estimated_annual_savings_kg: 500,
    },
    {
      category: "diet",
      action: "Try 2 plant-based meals per day.",
      estimated_annual_savings_kg: 400,
    },
  ],
  source: "rules",
};

describe("AiAssistant", () => {
  it("should not have any accessibility violations", async () => {
    const { container } = render(<AiAssistant insights={mockInsights} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders the section heading", () => {
    render(<AiAssistant insights={mockInsights} />);
    expect(screen.getByText("AI Reduction Insights")).toBeTruthy();
  });

  it("renders the summary text", () => {
    render(<AiAssistant insights={mockInsights} />);
    expect(
      screen.getByText("Your footprint is above the sustainable target.")
    ).toBeTruthy();
  });

  it("renders all recommendation cards", () => {
    render(<AiAssistant insights={mockInsights} />);
    expect(screen.getByText("Switch to public transit for daily commute.")).toBeTruthy();
    expect(screen.getByText("Try 2 plant-based meals per day.")).toBeTruthy();
  });

  it("displays estimated savings for each recommendation", () => {
    render(<AiAssistant insights={mockInsights} />);
    expect(screen.getByText(/500/)).toBeTruthy();
    expect(screen.getByText(/400/)).toBeTruthy();
  });

  it("shows the correct source label for rule-based insights", () => {
    render(<AiAssistant insights={mockInsights} />);
    expect(screen.getByText(/Rule-based engine/i)).toBeTruthy();
  });

  it("shows the correct source label for gemini insights", () => {
    const geminiInsights = { ...mockInsights, source: "gemini" };
    render(<AiAssistant insights={geminiInsights} />);
    expect(screen.getByText(/Google Gemini AI/i)).toBeTruthy();
  });

  it("renders the chat input field", () => {
    render(<AiAssistant insights={mockInsights} />);
    expect(screen.getByPlaceholderText(/How do I switch to an EV/i)).toBeTruthy();
  });

  it("renders category badges for each recommendation", () => {
    render(<AiAssistant insights={mockInsights} />);
    expect(screen.getByText("transport")).toBeTruthy();
    expect(screen.getByText("diet")).toBeTruthy();
  });

  it("renders empty chat state message", () => {
    render(<AiAssistant insights={mockInsights} />);
    expect(
      screen.getByText(/Ask me anything about reducing your carbon footprint/i)
    ).toBeTruthy();
  });
});
