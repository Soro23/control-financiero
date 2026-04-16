"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import type { MonthYear } from "@/types";

export interface MonthlyPoint {
  label: string;    // "Ene", "Feb", etc.
  month: number;
  year: number;
  ingresos: number;
  gastos: number;
}

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function prevMonths(from: MonthYear, count: number): MonthYear[] {
  const result: MonthYear[] = [];
  let { month, year } = from;
  for (let i = 0; i < count; i++) {
    result.unshift({ month, year });
    month--;
    if (month === 0) { month = 12; year--; }
  }
  return result;
}

async function fetchMonthTotal(
  userId: string,
  collection_name: "income_entries" | "expense_entries",
  year: number,
  month: number,
  db_instance: typeof db
): Promise<number> {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to   = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const q = query(
    collection(db_instance, "users", userId, collection_name),
    where("date", ">=", from),
    where("date", "<=", to),
    orderBy("date"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.reduce((s, d) => s + (d.data().amount as number), 0);
}

export function useMonthlyHistory(period: MonthYear, count = 6) {
  const [data, setData] = useState<MonthlyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUserId(u?.uid ?? null));
    return unsub;
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);

    const months = prevMonths(period, count);

    const points = await Promise.all(
      months.map(async ({ month, year }) => {
        const [ingresos, gastos] = await Promise.all([
          fetchMonthTotal(userId, "income_entries",  year, month, db),
          fetchMonthTotal(userId, "expense_entries", year, month, db),
        ]);
        return { label: MONTH_LABELS[month - 1], month, year, ingresos, gastos };
      })
    );

    setData(points);
    setLoading(false);
  }, [userId, period, count]);

  useEffect(() => {
    async function load() {
      if (userId !== null) await fetchHistory();
    }
    void load();
  }, [fetchHistory, userId]);

  return { data, loading };
}
