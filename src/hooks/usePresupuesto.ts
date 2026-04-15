"use client";

import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import type { BudgetDoc } from "@/types";

function budgetDocId(year: number, month: number) {
  return `${year}_${month}`;
}

export function usePresupuesto(year: number, month: number) {
  const [budgetEntries, setBudgetEntries] = useState<Record<string, number>>({});
  const [isTemplate, setIsTemplate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUserId(u?.uid ?? null));
    return unsub;
  }, []);

  const fetchBudget = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);

    // 1. Try specific month
    const monthRef = doc(db, "users", userId, "budgets", budgetDocId(year, month));
    const monthSnap = await getDoc(monthRef);

    if (monthSnap.exists()) {
      const data = monthSnap.data() as BudgetDoc;
      setBudgetEntries(data.entries ?? {});
      setIsTemplate(false);
      setLoading(false);
      return;
    }

    // 2. Fallback to template
    const templateRef = doc(db, "users", userId, "budgets", "template");
    const templateSnap = await getDoc(templateRef);

    if (templateSnap.exists()) {
      const data = templateSnap.data() as BudgetDoc;
      setBudgetEntries(data.entries ?? {});
      setIsTemplate(true);
    } else {
      setBudgetEntries({});
      setIsTemplate(true);
    }

    setLoading(false);
  }, [userId, year, month]);

  useEffect(() => {
    async function load() {
      if (userId !== null) await fetchBudget();
    }
    void load();
  }, [fetchBudget, userId]);

  async function saveBudget(
    entries: Record<string, number>,
    saveAsTemplate: boolean
  ): Promise<boolean> {
    if (!userId) return false;
    try {
      const data: BudgetDoc = { entries, updated_at: new Date().toISOString() };

      if (saveAsTemplate) {
        // Save as template
        const templateRef = doc(db, "users", userId, "budgets", "template");
        await setDoc(templateRef, data);
      }

      // Always save for this specific month too
      const monthRef = doc(db, "users", userId, "budgets", budgetDocId(year, month));
      await setDoc(monthRef, data);

      setBudgetEntries(entries);
      setIsTemplate(false);
      return true;
    } catch {
      return false;
    }
  }

  return { budgetEntries, isTemplate, loading, saveBudget, refetch: fetchBudget };
}
