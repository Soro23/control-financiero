"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import type { IncomeEntry, IncomeFormData } from "@/types";

function dateRange(year: number, month: number) {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

export function useIngresos(year: number, month: number) {
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUserId(u?.uid ?? null));
    return unsub;
  }, []);

  const fetchEntries = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);

    const { from, to } = dateRange(year, month);

    // Fetch entries
    const entriesQuery = query(
      collection(db, "users", userId, "income_entries"),
      where("date", ">=", from),
      where("date", "<=", to),
      orderBy("date", "desc")
    );
    const snap = await getDocs(entriesQuery);

    // Fetch categories para join manual
    const catsSnap = await getDocs(collection(db, "users", userId, "categories"));
    const catsMap = Object.fromEntries(catsSnap.docs.map((d) => [d.id, { id: d.id, ...d.data() }]));

    const result: IncomeEntry[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        user_id: userId,
        category_id: data.category_id,
        concept: data.concept,
        amount: data.amount,
        date: data.date,
        is_recurring: data.is_recurring ?? false,
        notes: data.notes ?? null,
        created_at: data.created_at,
        updated_at: data.updated_at ?? data.created_at,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        category: catsMap[data.category_id] as any,
      };
    });

    setEntries(result);
    setLoading(false);
  }, [userId, year, month]);

  useEffect(() => {
    if (userId !== null) fetchEntries();
  }, [fetchEntries, userId]);

  async function createIngreso(data: IncomeFormData): Promise<boolean> {
    if (!userId) return false;
    try {
      await addDoc(collection(db, "users", userId, "income_entries"), {
        ...data,
        notes: data.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      await fetchEntries();
      return true;
    } catch { return false; }
  }

  async function updateIngreso(id: string, data: Partial<IncomeFormData>): Promise<boolean> {
    if (!userId) return false;
    try {
      await updateDoc(doc(db, "users", userId, "income_entries", id), {
        ...data,
        notes: data.notes || null,
        updated_at: new Date().toISOString(),
      });
      await fetchEntries();
      return true;
    } catch { return false; }
  }

  async function deleteIngreso(id: string): Promise<boolean> {
    if (!userId) return false;
    try {
      await deleteDoc(doc(db, "users", userId, "income_entries", id));
      await fetchEntries();
      return true;
    } catch { return false; }
  }

  return { entries, loading, refetch: fetchEntries, createIngreso, updateIngreso, deleteIngreso };
}
