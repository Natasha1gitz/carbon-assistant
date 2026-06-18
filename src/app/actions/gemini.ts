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
import { unstable_cache } from "next/cache";
import { getInsightsPrompt } from "@/lib/prompts";

const apiKey = env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24 hours

/**
 * Fetch insights from Gemini, isolated into a function suitable for Next.js unstable_cache.
 * This utilizes the distributed Data Cache rather than an in-memory instance.
 * @param prompt - The formatted prompt string to send to Gemini.
 */
async function fetchGeminiInsights(prompt: string): Promise<InsightsResponse | null> {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const genResult = await model.generateContent(prompt);
    const text = genResult.response.text();
    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const rawPayload = JSON.parse(cleanText) as Record<string, unknown>;

    const validated = InsightsResponseSchema.safeParse({
      summary: rawPayload.summary,
      recommendations: Array.isArray(rawPayload.recommendations)
        ? rawPayload.recommendations.slice(0, 4)
        : [],
      source: "gemini",
    });

    if (!validated.success) {
      logger.warn("Gemini response failed schema validation");
      return null;
    }
    return validated.data;
  } catch (exc) {
    logger.error(
      { err: exc instanceof Error ? exc.message : String(exc) },
      "Gemini insight generation failed"
    );
    return null;
  }
}

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

  const prompt = getInsightsPrompt(
    JSON.stringify(result.breakdown_kg),
    result.total_annual_kg,
    result.total_annual_tonnes,
    result.comparison.sustainable_target_annual_kg,
    data.diet,
    data.transport.car_fuel
  );

  const cacheKey = JSON.stringify(validatedData.data);

  // Wrap the fetch call with Next.js distributed caching
  const getCachedInsights = unstable_cache(
    async () => fetchGeminiInsights(prompt),
    ["insights-cache", cacheKey],
    { revalidate: CACHE_TTL_SECONDS }
  );

  const geminiResponse = await getCachedInsights();

  if (geminiResponse) {
    return geminiResponse;
  }

  return generateRuleBasedInsights(data, result);
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

  // Explicit HTML stripping for defense in depth (prevents XSS on output)
  const sanitizedMessage = trimmed.replace(/<[^>]*>?/gm, "");

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
    const result = await chat.sendMessage(sanitizedMessage);
    return result.response.text();
  } catch (exc) {
    logger.error({ err: exc instanceof Error ? exc.message : String(exc) }, "Chat error");
    return "I'm having trouble connecting right now. Please try again later.";
  }
}
