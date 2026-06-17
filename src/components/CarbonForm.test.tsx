/// <reference types="vitest-axe/matchers" />
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, it, expect, vi } from "vitest";
import CarbonForm from "./CarbonForm";

describe("CarbonForm", () => {
  it("should not have any accessibility violations on step 1", async () => {
    const { container } = render(<CarbonForm onSubmit={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders the transport step by default", () => {
    render(<CarbonForm onSubmit={vi.fn()} />);
    expect(screen.getByText("🚗 Transport")).toBeTruthy();
  });

  it("navigates to step 2 when Next is clicked", () => {
    render(<CarbonForm onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByText("Next →"));
    expect(screen.getByText("🏠 Home Energy")).toBeTruthy();
  });

  it("navigates back from step 2", () => {
    render(<CarbonForm onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByText("Next →"));
    fireEvent.click(screen.getByText("← Back"));
    expect(screen.getByText("🚗 Transport")).toBeTruthy();
  });
});
