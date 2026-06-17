import { describe, it, expect, vi } from "vitest";

describe("logger", () => {
  it("initializes without pino-pretty in production", async () => {
    const originalEnv = process.env.NODE_ENV;
    // @ts-expect-error Mocking read-only property for test
    process.env.NODE_ENV = "production";
    
    vi.resetModules();
    // Dynamically import to ensure it evaluates with the mocked env var
    const { logger } = await import("./logger");
    
    expect(logger).toBeDefined();
    
    // Restore env
    // @ts-expect-error Mocking read-only property for test
    process.env.NODE_ENV = originalEnv;
  });
});
