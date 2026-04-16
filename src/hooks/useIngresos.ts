"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { backfillRecurringEntries } from "@/lib/firebase/recurring";
import type { IncomeEntry, IncomeFormData } from "@/types";

const PAGE_SIZE = 25;

function dateRange(year: number, month: number) {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

export function useIngresos(year: number, month: number) {
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const categoriesCacheRef = useRef<Record<string, DocumentData>>({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUserId(u?.uid ?? null));
    return unsub;
  }, []);

  const fetchCategories = useCallback(async (uid: string) => {
    const cached = Object.keys(categoriesCacheRef.current).length > 0;
    if (cached) return categoriesCacheRef.current;

    const catsSnap = await getDocs(
      query(
        collection(db, "users", uid, "categories"),
        where("type", "==", "income"),
        limit(100)
      )
    );
    const map: Record<string, DocumentData> = {};
    catsSnap.docs.forEach((d) => {
      map[d.id] = { id: d.id, ...d.data() };
    });
    categoriesCacheRef.current = map;
    return map;
  }, []);

  const fetchEntries = useCallback(async (isLoadMore = false) => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);

    await backfillRecurringEntries(userId, "income_entries");
    const catsMap = await fetchCategories(userId);
    const { from, to } = dateRange(year, month);

    let q = query(
      collection(db, "users", userId, "income_entries"),
      where("date", ">=", from),
      where("date", "<=", to),
      orderBy("date", "desc"),
      limit(PAGE_SIZE)
    );

    if (isLoadMore && lastDocRef.current) {
      q = query(
        collection(db, "users", userId, "income_entries"),
        where("date", ">=", from),
        where("date", "<=", to),
        orderBy("date", "desc"),
        limit(PAGE_SIZE),
        startAfter(lastDocRef.current)
      );
    }

    const snap = await getDocs(q);

    if (snap.empty) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    const lastDoc = snap.docs[snap.docs.length - 1];
    lastDocRef.current = lastDoc;

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
        category: catsMap[data.category_id] as IncomeEntry["category"],
      };
    });

    if (isLoadMore) {
      setEntries((prev) => [...prev, ...result]);
    } else {
      setEntries(result);
    }

    setHasMore(snap.docs.length === PAGE_SIZE);
    setLoading(false);
  }, [userId, year, month, fetchCategories]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    await fetchEntries(true);
    setLoadingMore(false);
  }, [hasMore, loadingMore, fetchEntries]);

  useEffect(() => {
    lastDocRef.current = null;
    categoriesCacheRef.current = {};
    setHasMore(true);
  }, [year, month]);

  useEffect(() => {
    async function load() {
      if (userId !== null) await fetchEntries();
    }
    void load();
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
      lastDocRef.current = null;
      categoriesCacheRef.current = {};
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

  return {
    entries,
    loading,
    loadingMore,
    hasMore,
    refetch: fetchEntries,
    loadMore,
    createIngreso,
    updateIngreso,
    deleteIngreso,
  };
}
