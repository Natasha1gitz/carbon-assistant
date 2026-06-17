import { describe, it, expect, beforeEach, vi } from "vitest";
import { faker } from "@faker-js/faker";
import { checkRateLimit } from "./rate-limiter";

describe("checkRateLimit", () => {
  // Each test uses a unique identifier so they don't interfere with each other
  let uniqueId: string;

  beforeEach(() => {
    uniqueId = faker.string.uuid();
  });

  it("allows requests under the limit", () => {
    const result = checkRateLimit(uniqueId);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(9);
    expect(result.limit).toBe(10);
  });

  it("decrements remaining count on each call", () => {
    checkRateLimit(uniqueId); // 1st
    checkRateLimit(uniqueId); // 2nd
    const result = checkRateLimit(uniqueId); // 3rd
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(7);
  });

  it("blocks requests that exceed the limit", () => {
    // Exhaust the limit
    for (let i = 0; i < 10; i++) {
      checkRateLimit(uniqueId);
    }
    // 11th request should be blocked
    const result = checkRateLimit(uniqueId);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks different identifiers independently", () => {
    const id1 = `${uniqueId}-a`;
    const id2 = `${uniqueId}-b`;

    // Exhaust id1
    for (let i = 0; i < 10; i++) {
      checkRateLimit(id1);
    }
    expect(checkRateLimit(id1).success).toBe(false);

    // id2 should still be allowed
    expect(checkRateLimit(id2).success).toBe(true);
  });

  it("includes a reset timestamp in the future", () => {
    const result = checkRateLimit(uniqueId);
    expect(result.reset).toBeGreaterThan(Date.now() - 1000);
  });

  it("resets the window after the time period expires", () => {
    vi.useFakeTimers();

    try {
      // Exhaust the limit
      for (let i = 0; i < 10; i++) {
        checkRateLimit(uniqueId);
      }
      expect(checkRateLimit(uniqueId).success).toBe(false);

      // Advance time past the 60-second window
      vi.advanceTimersByTime(61_000);

      // Should be allowed again after window expires
      const result = checkRateLimit(uniqueId);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
    } finally {
      vi.useRealTimers();
    }
  });
});
