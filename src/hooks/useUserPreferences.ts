"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import type { UserPreferences } from "@/types";

export const DEFAULT_PREFERENCES: Pick<
  UserPreferences,
  "currency_symbol" | "symbol_position" | "decimal_format"
> = {
  currency_symbol: "€",
  symbol_position: "after",
  decimal_format: "comma",
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUserId(u?.uid ?? null));
    return unsub;
  }, []);

  useEffect(() => {
    async function fetchPrefs() {
      if (!userId) { setLoading(false); return; }
      setLoading(true);
      const snap = await getDoc(doc(db, "users", userId, "preferences", "main"));
      if (snap.exists()) {
        setPreferences({ id: snap.id, user_id: userId, ...snap.data() } as UserPreferences);
      }
      setLoading(false);
    }

    void fetchPrefs();
  }, [userId]);

  async function updatePreferences(data: Partial<UserPreferences>): Promise<boolean> {
    if (!userId) return false;
    try {
      const ref = doc(db, "users", userId, "preferences", "main");
      await setDoc(ref, { ...data, updated_at: new Date().toISOString() }, { merge: true });
      setPreferences((prev) => prev ? { ...prev, ...data } : null);
      return true;
    } catch { return false; }
  }

  return { preferences, loading, updatePreferences };
}
