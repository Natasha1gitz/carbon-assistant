/**
 * Emission factors for carbon footprint estimation.
 *
 * All factors are expressed in **kilograms of CO2-equivalent (kg CO2e)** and are
 * documented with their source so the numbers are auditable rather than magic
 * constants. Figures are rounded, representative averages intended for awareness
 * and education — not regulatory accounting.
 *
 * Primary sources:
 *   - UK DEFRA / DESNZ 2023 Greenhouse Gas Conversion Factors
 *     https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023
 *   - US EPA — Greenhouse Gas Emissions from a Typical Passenger Vehicle
 *     https://www.epa.gov/greenvehicles
 *   - IPCC AR6 and Our World in Data — food & energy emissions
 *     https://ourworldindata.org/food-choice-vs-eating-local
 *   - Scarborough et al. 2014 — Dietary greenhouse gas emissions
 *
 * The platform reports estimates in kg CO2e per year unless noted otherwise.
 */

// ─── Time Conversions ─────────────────────────────────────────────
export const WEEKS_PER_YEAR = 52;
export const MONTHS_PER_YEAR = 12;

// ─── Car Fuel Types ───────────────────────────────────────────────
export type CarFuel = "petrol" | "diesel" | "hybrid" | "electric";

/**
 * kg CO2e per km driven (single occupant).
 * Source: DEFRA 2023 average car.
 */
export const CAR_FACTORS_PER_KM: Record<CarFuel, number> = {
  petrol: 0.17,
  diesel: 0.171,
  hybrid: 0.12,
  electric: 0.047, // includes grid generation emissions
};

/**
 * kg CO2e per passenger-km for public transit (bus/rail averages).
 * Source: DEFRA 2023.
 */
export const PUBLIC_TRANSIT_PER_KM = 0.06;

/**
 * kg CO2e per passenger-km for flights (incl. radiative forcing uplift).
 * Short-haul is more carbon-intensive per km than long-haul.
 * Source: DEFRA 2023.
 */
export const FLIGHT_SHORT_HAUL_PER_KM = 0.158;
export const FLIGHT_LONG_HAUL_PER_KM = 0.15;

/**
 * Representative one-way distances (km) used to convert "number of flights" → km.
 */
export const SHORT_HAUL_TRIP_KM = 1100;
export const LONG_HAUL_TRIP_KM = 6500;

// ─── Home Energy ──────────────────────────────────────────────────
/**
 * kg CO2e per kWh of grid electricity (global-ish average; grids vary widely).
 * Source: IEA / Our World in Data ~2022 world average.
 */
export const ELECTRICITY_PER_KWH = 0.45;

/**
 * kg CO2e per kWh of natural gas (heating).
 * Source: DEFRA 2023.
 */
export const NATURAL_GAS_PER_KWH = 0.183;

// ─── Diet ─────────────────────────────────────────────────────────
export type DietType =
  | "heavy_meat"
  | "medium_meat"
  | "low_meat"
  | "pescatarian"
  | "vegetarian"
  | "vegan";

/**
 * Annual kg CO2e attributable to diet type (food production footprint).
 * Source: Scarborough et al. 2014 / Our World in Data dietary footprints.
 */
export const DIET_ANNUAL_KG: Record<DietType, number> = {
  heavy_meat: 3300,
  medium_meat: 2500,
  low_meat: 1900,
  pescatarian: 1700,
  vegetarian: 1500,
  vegan: 1050,
};

// ─── Goods, Services & Waste ──────────────────────────────────────
/**
 * kg CO2e per USD spent on general consumer goods (rough EEIO-style intensity).
 * Source: derived from EXIOBASE / consumer-spend emission intensity studies.
 */
export const GOODS_PER_USD_MONTHLY = 0.4;

/**
 * kg CO2e per kg of landfilled waste (methane-weighted).
 * Source: EPA WARM model.
 */
export const WASTE_PER_KG = 0.58;

// ─── Reference Benchmarks ─────────────────────────────────────────
/**
 * Annual per-capita footprints for context/comparison (kg CO2e/yr).
 * Source: Our World in Data, 2022 per-capita consumption emissions.
 */
export const GLOBAL_AVG_ANNUAL_KG = 4800;

/**
 * Paris-aligned 2030 per-capita target (kg CO2e/yr).
 */
export const SUSTAINABLE_TARGET_ANNUAL_KG = 2000;
