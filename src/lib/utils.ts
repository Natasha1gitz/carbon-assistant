/**
 * Shared utility functions used across the calculation engine.
 *
 * Centralizing common helpers avoids duplication (DRY) and ensures
 * consistent behaviour throughout the application.
 */

/**
 * Round a number to a specified number of decimal places.
 * Uses integer multiplication to avoid floating-point drift.
 * @param value - The number to round.
 * @param decimals - Decimal places to keep (default 2).
 */
export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
