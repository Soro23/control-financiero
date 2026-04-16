"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  writeBatch,
  limit,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";

export type RuleBlock = "needs" | "wants" | "savings" | null;
export type CategoryType = "income" | "expense";

export interface CategoryFormData {
  name: string;
  type: CategoryType;
  rule_block: RuleBlock;
  parent_id?: string | null;
}

export function useCategoryMutations(onMutate?: () => void) {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUserId(u?.uid ?? null));
    return unsub;
  }, []);

  const getNextSortOrder = useCallback(async (type: CategoryType, parentId?: string | null): Promise<number> => {
    if (!userId) return 1;
    
    const q = query(
      collection(db, "users", userId, "categories"),
      where("type", "==", type),
      where("parent_id", "==", parentId ?? null),
      limit(100)
    );
    const snap = await getDocs(q);
    
    if (snap.empty) return 1;
    const maxOrder = Math.max(...snap.docs.map(d => (d.data().sort_order as number) || 0));
    return maxOrder + 1;
  }, [userId]);

  async function createCategory(data: CategoryFormData): Promise<boolean> {
    if (!userId) return false;
    setLoading(true);
    try {
      const sortOrder = await getNextSortOrder(data.type, data.parent_id ?? null);
      await addDoc(collection(db, "users", userId, "categories"), {
        name: data.name.trim(),
        type: data.type,
        rule_block: data.rule_block,
        parent_id: data.parent_id ?? null,
        is_default: false,
        is_active: true,
        sort_order: sortOrder,
        created_at: new Date().toISOString(),
      });
      onMutate?.();
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function updateCategory(id: string, data: Partial<CategoryFormData>): Promise<boolean> {
    if (!userId) return false;
    setLoading(true);
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (data.name !== undefined) updateData.name = data.name.trim();
      if (data.rule_block !== undefined) updateData.rule_block = data.rule_block;
      
      await updateDoc(doc(db, "users", userId, "categories", id), updateData);
      onMutate?.();
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function deleteCategory(id: string): Promise<boolean> {
    if (!userId) return false;
    setLoading(true);
    try {
      // Check if has children
      const childrenQuery = query(
        collection(db, "users", userId, "categories"),
        where("parent_id", "==", id),
        limit(50)
      );
      const childrenSnap = await getDocs(childrenQuery);
      
      const batch = writeBatch(db);
      childrenSnap.docs.forEach(d => {
        batch.delete(doc(db, "users", userId, "categories", d.id));
      });
      batch.delete(doc(db, "users", userId, "categories", id));
      await batch.commit();
      onMutate?.();
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function toggleCategory(id: string, isActive: boolean): Promise<boolean> {
    if (!userId) return false;
    try {
      await updateDoc(doc(db, "users", userId, "categories", id), {
        is_active: isActive,
      });
      onMutate?.();
      return true;
    } catch {
      return false;
    }
  }

  return {
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategory,
  };
}