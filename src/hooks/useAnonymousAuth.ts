"use client";
import { useEffect, useState } from "react";
import { auth, signInAnonymously } from "@/lib/firebase/client";

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
          console.error("Anonymous auth failed:", error);
          setLoading(false);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return { userId, loading };
}
