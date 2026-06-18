"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CarbonInput, InsightsResponse } from "@/lib/validators";
import {
  CarbonInputSchema,
  FootprintResultSchema,
  InsightsResponseSchema,
} from "@/lib/validators";
import type { FootprintResult } from "@/lib/validators";
import { generateRuleBasedInsights } from "@/lib/rules";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limiter";
import { headers } from "next/headers";
import { env } from "@/env";
import { LRUCache } from "lru-cache";

const apiKey = env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * In-memory LRU cache for Gemini insights responses.
 * Caching identical carbon profiles avoids redundant API calls,
 * reducing latency from ~3000ms to 0ms for repeated profiles.
 */
const insightsCache = new LRUCache<string, InsightsResponse>({
  max: 5000,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
});

/**
 * Return personalized insights, preferring Gemini and falling back to rules.
 * Performs server-side re-validation, rate limiting, and response caching.
 * @param data - Validated carbon input from the client.
 * @param result - The computed footprint result to analyze.
 */
export async function generateInsights(
  data: CarbonInput,
  result: FootprintResult
): Promise<InsightsResponse> {
  // Server-side re-validation (defense in depth — never trust the client)
  const validatedData = CarbonInputSchema.safeParse(data);
  const validatedResult = FootprintResultSchema.safeParse(result);

  if (!validatedData.success || !validatedResult.success) {
    logger.warn("Server-side validation failed for generateInsights");
    return generateRuleBasedInsights(data, result);
  }

  const cacheKey = JSON.stringify(validatedData.data);
  const cached = insightsCache.get(cacheKey);
  if (cached) {
    logger.info("Cache hit for carbon profile insights");
    return cached;
  }

  if (!genAI) {
    return generateRuleBasedInsights(data, result);
  }

  // Basic rate limiting via IP (or fallback identifier)
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "unknown-ip";
  const limitCheck = checkRateLimit(`insights_${ip}`);

  if (!limitCheck.success) {
    logger.warn({ ip }, "Rate limit exceeded for generateInsights");
    // Fallback to rules if rate-limited to avoid degrading UX
    return generateRuleBasedInsights(data, result);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a concise, encouraging sustainability coach. Given a person's annual
carbon footprint breakdown (kg CO2e), produce a short summary and 2-4 specific,
realistic actions that target their largest emission sources. Each action must
include an estimated annual saving in kg CO2e. Be practical and non-judgmental.

Carbon footprint breakdown (kg CO2e per year):
${JSON.stringify(result.breakdown_kg)}
Total: ${result.total_annual_kg} kg/yr (${result.total_annual_tonnes} t/yr).
Sustainable target: ${result.comparison.sustainable_target_annual_kg} kg/yr.
Diet: ${data.diet}. Car fuel: ${data.transport.car_fuel}.

Respond strictly in JSON format with this structure:
{
  "summary": "string",
  "recommendations": [
    { "category": "string", "action": "string", "estimated_annual_savings_kg": number }
  ]
}
Do not include any markdown formatting or extra text. Only return the JSON object.
    `.trim();

    const genResult = await model.generateContent(prompt);
    const text = genResult.response.text();
    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const rawPayload = JSON.parse(cleanText) as Record<string, unknown>;

    // Validate the AI response with Zod instead of unsafe type assertion
    const validated = InsightsResponseSchema.safeParse({
      summary: rawPayload.summary,
      recommendations: Array.isArray(rawPayload.recommendations)
        ? rawPayload.recommendations.slice(0, 4)
        : [],
      source: "gemini",
    });

    if (!validated.success) {
      logger.warn("Gemini response failed schema validation, using rule-based fallback");
      return generateRuleBasedInsights(data, result);
    }

    insightsCache.set(cacheKey, validated.data);
    return validated.data;
  } catch (exc) {
    logger.error(
      { err: exc instanceof Error ? exc.message : String(exc) },
      "Gemini insight generation failed, using rule-based fallback"
    );
    return generateRuleBasedInsights(data, result);
  }
}

/**
 * Continue a multi-turn chat with the AI assistant.
 * Performs input sanitization and rate limiting before sending to Gemini.
 * @param history - The conversation history for context.
 * @param message - The user's new message to send.
 */
export async function chatWithGemini(
  history: { role: string; parts: { text: string }[] }[],
  message: string
): Promise<string> {
  // Server-side input sanitization — reject oversized or empty messages
  const MAX_MESSAGE_LENGTH = 2000;
  const trimmed = message.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_MESSAGE_LENGTH) {
    return "Please enter a message (max 2000 characters).";
  }

  if (!genAI) {
    return "I am currently running in offline mode. Please set the GEMINI_API_KEY environment variable to enable AI chat.";
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "unknown-ip";
  const limitCheck = checkRateLimit(`chat_${ip}`);

  if (!limitCheck.success) {
    logger.warn({ ip }, "Rate limit exceeded for chatWithGemini");
    return "You're sending messages too fast! Please wait a moment.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (exc) {
    logger.error({ err: exc instanceof Error ? exc.message : String(exc) }, "Chat error");
    return "I'm having trouble connecting right now. Please try again later.";
  }
}
