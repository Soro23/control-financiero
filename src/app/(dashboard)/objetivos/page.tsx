"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { MonthSelector } from "@/components/shared/MonthSelector";
import { RuleSection } from "@/components/rule-50-30-20/RuleSection";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalForm } from "@/components/goals/GoalForm";
import { useIngresos } from "@/hooks/useIngresos";
import { useGastos } from "@/hooks/useGastos";
import { useCategories } from "@/hooks/useCategories";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useObjetivos } from "@/hooks/useObjetivos";
import { calcularBloques, generarInsightTexto } from "@/lib/calculations/rule503020";
import { calcularTotalMes } from "@/lib/calculations/ingresos";
import type { MonthYear, Category, SavingGoal } from "@/types";

export default function ObjetivosPage() {
  const now = new Date();
  const [period, setPeriod] = useState<MonthYear>({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null);

  const { entries: ingresos, loading: loadingI } = useIngresos(period.year, period.month);
  const { entries: gastos, loading: loadingG } = useGastos(period.year, period.month);
  const { categories, loading: loadingCats } = useCategories("expense");
  const { preferences } = useUserPreferences();
  const { goals, loading: loadingGoals, canCreate, createGoal, updateGoal, addContribution, deleteGoal } = useObjetivos();

  const loading = loadingI || loadingG || loadingCats;

  const flatCategories: Category[] = useMemo(
    () => categories.flatMap((c) => [c, ...(c.children ?? [])]),
    [categories]
  );

  const totalIngresos = useMemo(() => calcularTotalMes(ingresos), [ingresos]);
  const blocks = useMemo(
    () => calcularBloques(totalIngresos, gastos, flatCategories),
    [totalIngresos, gastos, flatCategories]
  );
  const insightText = useMemo(() => generarInsightTexto(blocks), [blocks]);

  function handleEdit(goal: SavingGoal) {
    setEditingGoal(goal);
    setFormOpen(true);
  }

  function handleNew() {
    setEditingGoal(null);
    setFormOpen(true);
  }

  async function handleDelete(id: string) {
    const ok = await deleteGoal(id);
    if (ok) toast.success("Objetivo eliminado");
    else toast.error("Error al eliminar el objetivo");
  }

  async function handleSubmit(data: Parameters<typeof createGoal>[0]) {
    if (editingGoal) {
      return updateGoal(editingGoal.id, data);
    }
    return createGoal(data);
  }

  return (
    <div className="py-8 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-headline text-slate-900 tracking-tight">Objetivos de ahorro</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Metas y regla 50/30/20</p>
        </div>
        <MonthSelector value={period} onChange={setPeriod} />
      </div>

      {/* ── Saving Goals ─────────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px] text-on-primary">savings</span>
            </div>
            <h2 className="text-lg font-bold font-headline text-slate-900">Metas de ahorro</h2>
            <span className="text-xs text-on-surface-variant">
              {goals.length}/5 activas
            </span>
          </div>
          {canCreate && (
            <button
              onClick={handleNew}
              className="gradient-primary text-on-primary px-4 py-2.5 rounded-xl font-bold font-headline text-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Nueva meta
            </button>
          )}
        </div>

        {loadingGoals ? (
          <div className="py-12 text-center text-sm text-on-surface-variant">Cargando objetivos...</div>
        ) : goals.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_2px_12px_rgba(25,28,30,0.06)] p-10 text-center">
            <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[28px] text-on-primary">savings</span>
            </div>
            <h3 className="font-headline font-bold text-slate-900 mb-2">Sin objetivos todavía</h3>
            <p className="text-sm text-on-surface-variant max-w-xs mx-auto mb-5">
              Crea tu primera meta de ahorro y haz seguimiento de tu progreso mes a mes.
            </p>
            <button
              onClick={handleNew}
              className="gradient-primary text-on-primary px-6 py-3 rounded-xl font-bold font-headline text-sm hover:opacity-90 active:scale-95 transition-all"
            >
              Crear primer objetivo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                preferences={preferences}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onContribute={addContribution}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Regla 50/30/20 ───────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px] text-on-primary">pie_chart</span>
          </div>
          <h2 className="text-lg font-bold font-headline text-slate-900">Regla 50/30/20</h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-on-surface-variant">Cargando datos...</div>
        ) : (
          <RuleSection blocks={blocks} insightText={insightText} preferences={preferences} />
        )}
      </section>

      {/* Goal form modal */}
      <GoalForm
        open={formOpen}
        onOpenChange={(v) => { setFormOpen(v); if (!v) setEditingGoal(null); }}
        goal={editingGoal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
