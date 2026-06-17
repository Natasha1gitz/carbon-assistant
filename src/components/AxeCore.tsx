"use client";

import React, { useEffect } from "react";

/**
 * Initializes axe-core for runtime accessibility auditing.
 * Only runs in development mode. Violations are logged to the console.
 */
export default function AxeCore() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
      Promise.all([import("@axe-core/react"), import("react-dom")]).then(
        ([axe, ReactDOM]) => {
          axe.default(React, ReactDOM, 1000, {});
        }
      );
    }
  }, []);

  return null;
}
