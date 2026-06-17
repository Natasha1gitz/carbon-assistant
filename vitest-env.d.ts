/// <reference types="vitest" />
import type { AxeMatchers } from "vitest-axe";

declare module "vitest" {
  /* eslint-disable @typescript-eslint/no-empty-object-type */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  export interface Assertion<T = any> extends AxeMatchers {}
  export interface AsymmetricMatchersContaining extends AxeMatchers {}
}
