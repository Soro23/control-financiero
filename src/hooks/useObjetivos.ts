"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import type { SavingGoal, SavingGoalFormData } from "@/types";

const MAX_GOALS = 5;

export function useObjetivos() {
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUserId(u?.uid ?? null));
    return unsub;
  }, []);

  const fetchGoals = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);

    const q = query(
      collection(db, "users", userId, "saving_goals"),
      orderBy("created_at", "asc"),
      limit(5)
    );
    const snap = await getDocs(q);

    const result: SavingGoal[] = snap.docs.map((d) => ({
      id: d.id,
      user_id: userId,
      ...(d.data() as Omit<SavingGoal, "id" | "user_id">),
    }));

    setGoals(result);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    async function load() {
      if (userId !== null) await fetchGoals();
    }
    void load();
  }, [fetchGoals, userId]);

  async function createGoal(data: SavingGoalFormData): Promise<boolean> {
    if (!userId || goals.length >= MAX_GOALS) return false;
    try {
      await addDoc(collection(db, "users", userId, "saving_goals"), {
        ...data,
        accumulated: 0,
        current_amount: 0,
        is_emergency_fund: data.is_emergency_fund ?? false,
        deadline: data.deadline ?? null,
        monthly_contribution: data.monthly_contribution ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      await fetchGoals();
      return true;
    } catch { return false; }
  }

  async function updateGoal(id: string, data: Partial<SavingGoalFormData>): Promise<boolean> {
    if (!userId) return false;
    try {
      await updateDoc(doc(db, "users", userId, "saving_goals", id), {
        ...data,
        deadline: data.deadline ?? null,
        monthly_contribution: data.monthly_contribution ?? null,
        updated_at: new Date().toISOString(),
      });
      await fetchGoals();
      return true;
    } catch { return false; }
  }

  async function addContribution(id: string, amount: number): Promise<boolean> {
    if (!userId) return false;
    const goal = goals.find((g) => g.id === id);
    if (!goal) return false;
    try {
      const newAccumulated = goal.accumulated + amount;
      const newCurrentAmount = goal.current_amount + amount;
      await updateDoc(doc(db, "users", userId, "saving_goals", id), {
        accumulated: newAccumulated,
        current_amount: newCurrentAmount,
        updated_at: new Date().toISOString(),
      });
      await fetchGoals();
      return true;
    } catch { return false; }
  }

  async function deleteGoal(id: string): Promise<boolean> {
    if (!userId) return false;
    try {
      await deleteDoc(doc(db, "users", userId, "saving_goals", id));
      await fetchGoals();
      return true;
    } catch { return false; }
  }

  return {
    goals,
    loading,
    canCreate: goals.length < MAX_GOALS,
    createGoal,
    updateGoal,
    addContribution,
    deleteGoal,
    refetch: fetchGoals,
  };
}
