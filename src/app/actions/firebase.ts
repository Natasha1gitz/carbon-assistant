"use server";

import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import type { CarbonInput, FootprintResult } from "@/lib/validators";
import { logger } from "@/lib/logger";

// Initialize Firebase Admin — uses Application Default Credentials (the Cloud
// Run service account in production, `gcloud auth application-default login`
// locally). If credentials are unavailable, operations degrade gracefully.
if (getApps().length === 0) {
  try {
    initializeApp({
      credential: applicationDefault(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project-id",
    });
  } catch {
    logger.warn("Firebase Admin: initialization skipped (no credentials)");
  }
}

/**
 * Persist a footprint entry for the anonymous device.
 * @param userId - The anonymous Firebase user ID.
 * @param data - The validated carbon input from the form.
 * @param result - The computed footprint result to store.
 */
export async function saveFootprintResult(
  userId: string,
  data: CarbonInput,
  result: FootprintResult
): Promise<{ success: boolean; id: string }> {
  if (!userId) {
    throw new Error("User ID is required to save footprint");
  }

  try {
    const db = getFirestore();
    const docRef = await db.collection("users").doc(userId).collection("footprints").add({
      input: data,
      result,
      timestamp: FieldValue.serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch {
    logger.warn("Firestore save unavailable — using mock");
    return { success: true, id: "mock-id" };
  }
}

/** Shape of a stored footprint entry returned to the client. */
interface StoredEntry {
  id: string;
  created_at: string;
  input: CarbonInput;
  result: FootprintResult;
}

/**
 * Return the user's footprint history, newest first.
 * @param userId - The anonymous Firebase user ID.
 */
export async function getFootprintHistory(userId: string): Promise<StoredEntry[]> {
  if (!userId) return [];

  try {
    const db = getFirestore();
    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("footprints")
      .orderBy("timestamp", "desc")
      .limit(10)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data() as {
        input: CarbonInput;
        result: FootprintResult;
        timestamp: { toDate: () => Date };
      };
      return {
        id: doc.id,
        created_at: data.timestamp?.toDate?.()?.toISOString() ?? new Date().toISOString(),
        input: data.input,
        result: data.result,
      };
    });
  } catch {
    logger.warn("Firestore read unavailable — returning empty history");
    return [];
  }
}
