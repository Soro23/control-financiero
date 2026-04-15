"use client";

import { useState, useMemo } from "react";
import { MonthSelector } from "@/components/shared/MonthSelector";
import { RuleSection } from "@/components/rule-50-30-20/RuleSection";
import { useIngresos } from "@/hooks/useIngresos";
import { useGastos } from "@/hooks/useGastos";
import { useCategories } from "@/hooks/useCategories";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { calcularBloques, generarInsightTexto } from "@/lib/calculations/rule503020";
import { calcularTotalMes } from "@/lib/calculations/ingresos";
import type { MonthYear, Category } from "@/types";

export default function ObjetivosPage() {
  const now = new Date();
  const [period, setPeriod] = useState<MonthYear>({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  const { entries: ingresos, loading: loadingI } = useIngresos(period.year, period.month);
  const { entries: gastos, loading: loadingG } = useGastos(period.year, period.month);
  const { categories, loading: loadingCats } = useCategories("expense");
  const { preferences } = useUserPreferences();

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

  return (
    <div className="py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-headline text-slate-900 tracking-tight">Objetivos de ahorro</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Regla 50/30/20 y distribución de gastos</p>
        </div>
        <MonthSelector value={period} onChange={setPeriod} />
      </div>

      {/* Rule 50/30/20 section */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px] text-on-primary">pie_chart</span>
          </div>
          <h2 className="text-lg font-bold font-headline text-slate-900">Regla 50/30/20</h2>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-on-surface-variant">Cargando datos...</div>
        ) : (
          <RuleSection
            blocks={blocks}
            insightText={insightText}
            preferences={preferences}
          />
        )}
      </div>

      {/* Placeholder for Phase 3: Saving Goals */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-[0_2px_12px_rgba(25,28,30,0.06)] p-8 text-center">
        <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[28px] text-on-primary">savings</span>
        </div>
        <h3 className="font-headline font-bold text-slate-900 mb-2">Metas de ahorro</h3>
        <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
          Próximamente — crea hasta 5 objetivos de ahorro con seguimiento de progreso y fecha estimada de consecución.
        </p>
      </div>
    </div>
  );
}
