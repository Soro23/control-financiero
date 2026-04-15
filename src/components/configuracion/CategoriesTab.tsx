"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";
import { useCategoryMutations } from "@/hooks/useCategoryMutations";
import { CategoryModal } from "./CategoryModal";
import type { Category, CategoryWithChildren } from "@/types";

const BLOCK_LABELS: Record<string, string> = {
  needs: "Necesidades",
  wants: "Deseos",
  savings: "Ahorro",
};

function CategoryRow({
  category,
  userId,
  onToggle,
  onDelete,
  onEdit,
}: {
  category: Category;
  userId: string;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
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
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 rounded-xl transition-colors",
        category.is_active ? "bg-surface-container-low" : "bg-surface-container-low/40 opacity-60"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full shrink-0",
            category.type === "income" ? "bg-secondary/10 text-secondary" : "bg-tertiary/10 text-tertiary"
          )}
        >
          {category.type === "income" ? "Ingreso" : "Gasto"}
        </span>
        <span className="text-sm font-medium text-on-surface truncate">{category.name}</span>
        {category.rule_block && (
          <span className="text-xs text-on-surface-variant shrink-0">· {BLOCK_LABELS[category.rule_block]}</span>
        )}
        {category.is_default && (
          <span className="text-xs text-outline-variant shrink-0">· Predefinida</span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {!category.is_default && (
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface transition-colors"
            aria-label="Editar categoría"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
        )}
        {!category.is_default && category.parent_id && (
          <button
            onClick={onDelete}
            disabled={loading}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors disabled:opacity-50"
            aria-label="Eliminar categoría"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        )}
        <button
          onClick={handleToggle}
          disabled={loading}
          className={cn(
            "relative w-10 h-5 rounded-full transition-colors disabled:opacity-50 shrink-0",
            category.is_active ? "bg-primary" : "bg-outline-variant/30"
          )}
          aria-label={category.is_active ? "Desactivar categoría" : "Activar categoría"}
        >
          <div
            className={cn(
              "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
              category.is_active ? "translate-x-5" : "translate-x-0.5"
            )}
          />
        </button>
      </div>
    </div>
  );
}

export function CategoriesTab() {
  const { categories: incomeCategories, loading: loadingI, refetch: refetchI } = useCategories("income");
  const { categories: expenseCategories, loading: loadingE, refetch: refetchE } = useCategories("expense");
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<"expense" | "income">("expense");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentCategory, setParentCategory] = useState<CategoryWithChildren | null>(null);

  const { deleteCategory } = useCategoryMutations(() => {
    refetchI();
    refetchE();
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUserId(u?.uid ?? null));
    return unsub;
  }, []);

  const loading = loadingI || loadingE;

  const expenseFlat = expenseCategories.flatMap((c) => [
    c,
    ...(c.children ?? []).map((child) => ({ ...child, _indent: true })),
  ]);
  const incomeFlat = incomeCategories;

  const currentList = tab === "expense" ? expenseFlat : incomeFlat;

function handleToggle() {
    refetchI();
    refetchE();
    toast.success("Categoría actualizada");
  }

  function handleAddCategory() {
    setEditingCategory(null);
    setParentCategory(null);
    setModalOpen(true);
  }

  function handleAddSubcategory(parent: CategoryWithChildren) {
    setEditingCategory(null);
    setParentCategory(parent);
    setModalOpen(true);
  }

  function handleEditCategory(cat: Category) {
    setParentCategory(null);
    setEditingCategory(cat);
    setModalOpen(true);
  }

  async function handleDeleteCategory(cat: Category) {
    if (!confirm(`¿Eliminar "${cat.name}" y todas sus subcategorías?`)) return;
    const ok = await deleteCategory(cat.id);
    if (ok) toast.success("Categoría eliminada");
    else toast.error("Error al eliminar la categoría");
  }

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex border-b border-outline-variant/10">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-3.5 text-sm font-bold font-headline transition-colors flex items-center justify-center gap-2",
              tab === t
                ? "text-on-surface border-b-2 border-on-surface"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <span className="material-symbols-outlined text-[16px]">
              {t === "expense" ? "receipt_long" : "payments"}
            </span>
            {t === "expense" ? "Gastos" : "Ingresos"}
          </button>
        ))}
      </div>

      <div className="p-5">
        {loading || !userId ? (
          <div className="py-10 text-center">
            <div className="w-6 h-6 border-2 border-outline-variant/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-on-surface-variant">Cargando categorías...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header con botón añadir */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-on-surface">
                {currentList.length} categoría{currentList.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={handleAddCategory}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Añadir
              </button>
            </div>

            {currentList.length === 0 ? (
              <div className="py-10 text-center">
                <span className="material-symbols-outlined text-4xl text-outline-variant">category</span>
                <p className="text-sm text-on-surface-variant mt-2">No hay categorías. Crea una para empezar.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentList.map((cat) => (
                  <div
                    key={cat.id}
                    className={(cat as Category & { _indent?: boolean })._indent ? "ml-6" : ""}
                  >
                    <CategoryRow
                      category={cat as Category}
                      userId={userId}
                      onToggle={handleToggle}
                      onDelete={() => handleDeleteCategory(cat as Category)}
                      onEdit={() => handleEditCategory(cat as Category)}
                    />
                    {/* Botón añadir subcategoría para categorías padre */}
                    {(cat as CategoryWithChildren).children && (cat as CategoryWithChildren).children!.length > 0 && (
                      <button
                        onClick={() => handleAddSubcategory(cat as CategoryWithChildren)}
                        className="ml-6 mt-1 flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                        Añadir subcategoría
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <CategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editCategory={editingCategory}
        parentCategory={parentCategory}
        defaultType={tab}
        onSuccess={() => {
          refetchI();
          refetchE();
        }}
      />
    </div>
  );
}