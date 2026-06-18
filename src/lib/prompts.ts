/* v8 ignore start */
/**
 * Core system prompts for the Gemini AI integration.
 *
 * Extracting prompts from execution logic ensures a clean Separation of Concerns (SoC).
 * This allows prompt engineers to tune AI behavior without touching the application code,
 * and keeps server actions focused solely on data fetching and validation.
 */

/**
 * Generates the system prompt for analyzing a user's carbon footprint.
 * @param breakdownString - JSON string of the user's footprint breakdown.
 * @param totalKg - Total annual emissions in kg CO2e.
 * @param totalTonnes - Total annual emissions in tonnes CO2e.
 * @param targetKg - The sustainable target in kg CO2e.
 * @param diet - The user's diet profile.
 * @param carFuel - The user's primary car fuel type.
 * @returns The fully formatted prompt string.
 */
export function getInsightsPrompt(
  breakdownString: string,
  totalKg: number,
  totalTonnes: number,
  targetKg: number,
  diet: string,
  carFuel: string
): string {
  return `
You are a concise, encouraging sustainability coach. Given a person's annual
carbon footprint breakdown (kg CO2e), produce a short summary and 2-4 specific,
realistic actions that target their largest emission sources. Each action must
include an estimated annual saving in kg CO2e. Be practical and non-judgmental.

Carbon footprint breakdown (kg CO2e per year):
${breakdownString}
Total: ${totalKg} kg/yr (${totalTonnes} t/yr).
Sustainable target: ${targetKg} kg/yr.
Diet: ${diet}. Car fuel: ${carFuel}.

Respond strictly in JSON format with this structure:
{
  "summary": "string",
  "recommendations": [
    { "category": "string", "action": "string", "estimated_annual_savings_kg": number }
  ]
}
Do not include any markdown formatting or extra text. Only return the JSON object.
`.trim();
}
