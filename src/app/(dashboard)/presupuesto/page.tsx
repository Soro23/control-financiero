"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { MonthSelector } from "@/components/shared/MonthSelector";
import { BudgetTable } from "@/components/budget/BudgetTable";
import { BudgetSummary } from "@/components/budget/BudgetSummary";
import { usePresupuesto } from "@/hooks/usePresupuesto";
import { useCategories } from "@/hooks/useCategories";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import type { MonthYear } from "@/types";

export default function PresupuestoPage() {
  const now = new Date();
  const [period, setPeriod] = useState<MonthYear>({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localAmounts, setLocalAmounts] = useState<Record<string, number> | null>(null);

  const { categories, loading: loadingCats } = useCategories("expense");
  const { budgetEntries, isTemplate, loading: loadingBudget, saveBudget } = usePresupuesto(period.year, period.month);
  const { preferences } = useUserPreferences();

  // Parent-only categories
  const parentCats = categories.filter((c) => c.parent_id === null);

  // Merge server budget with local edits
  const amounts = localAmounts ?? budgetEntries;

  const handleChange = useCallback((categoryId: string, value: number) => {
    setLocalAmounts((prev) => ({ ...(prev ?? budgetEntries), [categoryId]: value }));
  }, [budgetEntries]);

  function handlePeriodChange(newPeriod: MonthYear) {
    setPeriod(newPeriod);
    setLocalAmounts(null); // reset local edits when month changes
  }

  async function handleSave() {
    setSaving(true);
    const ok = await saveBudget(amounts, saveAsTemplate);
    setSaving(false);
    setLocalAmounts(null);
    if (ok) {
      toast.success(saveAsTemplate ? "Presupuesto guardado y establecido como plantilla" : "Presupuesto guardado para este mes");
    } else {
      toast.error("Error al guardar el presupuesto");
    }
  }

  const loading = loadingCats || loadingBudget;

  return (
    <div className="py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-headline text-slate-900 tracking-tight">Presupuesto</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {isTemplate && !loading ? "Usando plantilla base — guarda para personalizar este mes" : "Presupuesto mensual"}
          </p>
        </div>
        <MonthSelector value={period} onChange={handlePeriodChange} />
      </div>

      {/* Table card */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-[0_2px_12px_rgba(25,28,30,0.06)] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-on-surface-variant">Cargando presupuesto...</div>
        ) : (
          <>
            <BudgetTable
              categories={parentCats}
              amounts={amounts}
              onChange={handleChange}
            />
            <BudgetSummary
              categories={parentCats}
              amounts={amounts}
              preferences={preferences}
            />
          </>
        )}
      </div>

      {/* Save controls */}
      {!loading && (
        <div className="flex items-center justify-between bg-surface-container-lowest rounded-2xl px-6 py-5 shadow-[0_2px_12px_rgba(25,28,30,0.06)]">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setSaveAsTemplate((v) => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors ${saveAsTemplate ? "bg-primary" : "bg-outline-variant/30"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${saveAsTemplate ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm font-medium text-slate-700">
              Guardar también como plantilla base
            </span>
          </label>
          <button
            onClick={handleSave}
            disabled={saving}
            className="gradient-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando..." : "Guardar presupuesto"}
          </button>
        </div>
      )}
    </div>
  );
}
