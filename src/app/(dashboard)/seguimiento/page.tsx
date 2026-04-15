"use client";

import { useState, useMemo } from "react";
import { MonthSelector } from "@/components/shared/MonthSelector";
import { TrackingTable } from "@/components/budget/TrackingTable";
import { TrackingKPIs } from "@/components/budget/TrackingKPIs";
import { InsightsList } from "@/components/budget/InsightsList";
import { usePresupuesto } from "@/hooks/usePresupuesto";
import { useGastos } from "@/hooks/useGastos";
import { useCategories } from "@/hooks/useCategories";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { buildTrackingData, generateInsights } from "@/lib/calculations/seguimiento";
import type { MonthYear, Category } from "@/types";

export default function SeguimientoPage() {
  const now = new Date();
  const [period, setPeriod] = useState<MonthYear>({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  const { categories, loading: loadingCats } = useCategories("expense");
  const { budgetEntries, loading: loadingBudget } = usePresupuesto(period.year, period.month);
  const { entries: gastos, loading: loadingGastos } = useGastos(period.year, period.month);
  const { preferences } = useUserPreferences();

  const loading = loadingCats || loadingBudget || loadingGastos;

  // Flatten category tree for calculations
  const flatCategories: Category[] = useMemo(() => {
    return categories.flatMap((c) => [c, ...(c.children ?? [])]);
  }, [categories]);

  const trackingData = useMemo(
    () => buildTrackingData(flatCategories, budgetEntries, gastos),
    [flatCategories, budgetEntries, gastos]
  );

  const insights = useMemo(() => generateInsights(trackingData), [trackingData]);

  return (
    <div className="py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-headline text-slate-900 tracking-tight">Seguimiento</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Presupuesto vs gastos reales</p>
        </div>
        <MonthSelector value={period} onChange={setPeriod} />
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-on-surface-variant">Cargando seguimiento...</div>
      ) : (
        <>
          {/* KPI cards */}
          <TrackingKPIs entries={trackingData} preferences={preferences} />

          {/* Tracking table */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_2px_12px_rgba(25,28,30,0.06)] overflow-hidden">
            <div className="px-6 py-5 border-b border-outline-variant/10">
              <h2 className="font-headline font-bold text-slate-900">Desglose por categoría</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Comparativa real vs presupuestado</p>
            </div>
            <TrackingTable entries={trackingData} preferences={preferences} />
          </div>

          {/* Insights */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_2px_12px_rgba(25,28,30,0.06)] p-6">
            <h2 className="font-headline font-bold text-slate-900 mb-4">Alertas y análisis</h2>
            <InsightsList insights={insights} />
          </div>
        </>
      )}
    </div>
  );
}
