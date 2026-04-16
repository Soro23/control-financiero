"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
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
  const [hasMore, setHasMore] = useState<boolean>(() => true);
  const [userId, setUserId] = useState<string | null>(null);
  const [totalMes, setTotalMes] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
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

    const allQuery = query(
      collection(db, "users", userId, "income_entries"),
      where("date", ">=", from),
      where("date", "<=", to),
      orderBy("date", "desc")
    );

    const allSnap = await getDocs(allQuery);
    const totalDocs = allSnap.size;
    const total = allSnap.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0);
    setTotalMes(total);
    setTotalCount(totalDocs);

    const docsToShow = allSnap.docs.slice(0, PAGE_SIZE);
    const lastDoc = docsToShow[docsToShow.length - 1];

    if (lastDoc) {
      lastDocRef.current = lastDoc as QueryDocumentSnapshot<DocumentData>;
    }

    const result: IncomeEntry[] = docsToShow.map((d) => {
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

    setEntries(result);
    setHasMore(totalDocs > PAGE_SIZE);
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
    setTotalMes(0);
    setTotalCount(0);
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
    totalMes,
    totalCount,
    refetch: fetchEntries,
    loadMore,
    createIngreso,
    updateIngreso,
    deleteIngreso,
  };
}
