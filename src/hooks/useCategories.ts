"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import type { CategoryWithChildren } from "@/types";

export function useCategories(type: "income" | "expense") {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUserId(u?.uid ?? null));
    return unsub;
  }, []);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    async function fetchCategories() {
      setLoading(true);
      const q = query(
        collection(db, "users", userId!, "categories"),
        where("type", "==", type),
        where("is_active", "==", true),
        orderBy("sort_order")
      );
      const snap = await getDocs(q);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const all = snap.docs.map((d) => ({ id: d.id, user_id: userId!, ...d.data() })) as any[];
      const parents = all.filter((c) => c.parent_id === null) as CategoryWithChildren[];
      const children = all.filter((c) => c.parent_id !== null);

      const tree: CategoryWithChildren[] = parents.map((p) => ({
        ...p,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        children: children.filter((c) => c.parent_id === p.id) as any,
      }));

      setCategories(tree);
      setLoading(false);
    }

    fetchCategories();
  }, [userId, type]);

  return { categories, loading };
}
