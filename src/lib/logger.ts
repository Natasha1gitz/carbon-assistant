/**
 * Structured JSON logger for server-side operations.
 *
 * Uses pino for high-performance, structured logging. In development,
 * output is piped through pino-pretty for human-readable console logs.
 * In production, raw JSON is emitted for log aggregation services.
 */
import pino from "pino";

/** Singleton pino logger instance used throughout the server-side codebase. */
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  /* v8 ignore next 8 -- development-only transport, not tested */
  ...(process.env.NODE_ENV === "development"
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }
    : {}),
});
