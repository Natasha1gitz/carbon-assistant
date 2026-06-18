"use client";
import { useEffect, useState } from "react";
import { auth, signInAnonymously } from "@/lib/firebase/client";
import { logger } from "@/lib/logger";

/**
 * Hook that provides anonymous Firebase authentication.
 * Automatically signs in the user anonymously on mount and
 * returns the userId once authentication completes.
 */
export function useAnonymousAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        setLoading(false);
      } else {
        signInAnonymously(auth).catch((error: Error) => {
          logger.error({ err: error.message }, "Anonymous auth failed");
          setLoading(false);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return { userId, loading };
}
