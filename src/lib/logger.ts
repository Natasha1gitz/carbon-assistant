import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  /* v8 ignore next 8 */
  ...(process.env.NODE_ENV === "development"
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }
    : {}),
});
