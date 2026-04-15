"use client";

import { useState } from "react";
import { toast } from "sonner";
import { doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";
import { useEffect } from "react";
import type { Category } from "@/types";

const BLOCK_LABELS: Record<string, string> = {
  needs: "Necesidades",
  wants: "Deseos",
  savings: "Ahorro",
};

function CategoryRow({
  category,
  userId,
  onToggle,
}: {
  category: Category;
  userId: string;
  onToggle: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", userId, "categories", category.id), {
        is_active: !category.is_active,
      });
      onToggle();
    } catch {
      toast.error("Error al actualizar la categoría");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-3 rounded-xl transition-colors",
      category.is_active ? "bg-surface-container-low" : "bg-surface-container-low/40 opacity-60"
    )}>
      <div className="flex items-center gap-3">
        <span className={cn(
          "text-xs font-bold px-2 py-0.5 rounded-full",
          category.type === "income" ? "bg-secondary/10 text-secondary" : "bg-tertiary/10 text-tertiary"
        )}>
          {category.type === "income" ? "Ingreso" : "Gasto"}
        </span>
        <span className="text-sm font-medium text-slate-900">{category.name}</span>
        {category.rule_block && (
          <span className="text-xs text-on-surface-variant">· {BLOCK_LABELS[category.rule_block]}</span>
        )}
        {category.is_default && (
          <span className="text-xs text-outline-variant">· Predefinida</span>
        )}
      </div>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={cn(
          "relative w-10 h-5 rounded-full transition-colors disabled:opacity-50",
          category.is_active ? "bg-primary" : "bg-outline-variant/30"
        )}
      >
        <div className={cn(
          "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
          category.is_active ? "translate-x-5" : "translate-x-0.5"
        )} />
      </button>
    </div>
  );
}

export function CategoriesTab() {
  const { categories: incomeCategories, loading: loadingI } = useCategories("income");
  const { categories: expenseCategories, loading: loadingE } = useCategories("expense");
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<"income" | "expense">("expense");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUserId(u?.uid ?? null));
    return unsub;
  }, []);

  const loading = loadingI || loadingE;

  // Flatten for display: parents + children indented
  const expenseFlat = expenseCategories.flatMap((c) => [
    c,
    ...(c.children ?? []).map((child) => ({ ...child, _indent: true })),
  ]);
  const incomeFlat = incomeCategories;

  const currentList = tab === "expense" ? expenseFlat : incomeFlat;

  function handleToggle() {
    // Trigger re-fetch by relying on useCategories re-running next render
    // (it's subscribed to auth state, just force a key change here isn't easy)
    // The updateDoc change propagates on next mount. For now, show toast.
    toast.success("Categoría actualizada");
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-[0_2px_12px_rgba(25,28,30,0.06)] overflow-hidden">
      {/* Sub-tabs */}
      <div className="flex border-b border-outline-variant/10">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-4 text-sm font-bold font-headline transition-colors",
              tab === t
                ? "text-slate-900 border-b-2 border-slate-900"
                : "text-on-surface-variant hover:text-slate-700"
            )}
          >
            {t === "expense" ? "Gastos" : "Ingresos"}
          </button>
        ))}
      </div>

      <div className="p-5">
        {loading || !userId ? (
          <p className="text-sm text-center text-on-surface-variant py-8">Cargando categorías...</p>
        ) : (
          <div className="space-y-2">
            {currentList.map((cat) => (
              <div
                key={cat.id}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                className={(cat as any)._indent ? "ml-6" : ""}
              >
                <CategoryRow
                  category={cat}
                  userId={userId}
                  onToggle={handleToggle}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
