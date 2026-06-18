/**
 * Firebase client SDK initialization for the browser.
 *
 * Uses the public Firebase configuration from environment variables
 * and exports the auth instance and anonymous sign-in helper.
 * Initialization is idempotent — safe to import from multiple modules.
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";

import { env } from "@/env";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key",
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-domain",
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project",
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-bucket",
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock-sender",
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID || "mock-app",
};

// Initialize Firebase only if it hasn't been already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);

export { auth, signInAnonymously };
