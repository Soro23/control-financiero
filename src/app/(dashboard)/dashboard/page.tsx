"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MonthSelector } from "@/components/shared/MonthSelector";
import { KPICard } from "@/components/shared/KPICard";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { Rule503020Mini } from "@/components/dashboard/Rule503020Mini";
import { useIngresos } from "@/hooks/useIngresos";
import { useGastos } from "@/hooks/useGastos";
import { useCategories } from "@/hooks/useCategories";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useMonthlyHistory } from "@/hooks/useMonthlyHistory";
import { calcularKPIs } from "@/lib/calculations/dashboard";
import { calcularBloques } from "@/lib/calculations/rule503020";
import { calcularPorcentajePorCategoria } from "@/lib/calculations/gastos";
import { formatCurrency, DEFAULT_PREFERENCES } from "@/lib/utils/formatCurrency";
import { formatDate } from "@/lib/utils/formatDate";
import type { MonthYear, Category } from "@/types";

const CashFlowChart = dynamic(
  () => import("@/components/dashboard/CashFlowChart").then((mod) => mod.CashFlowChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-56 animate-pulse bg-surface-container-low rounded-2xl flex items-center justify-center text-sm text-on-surface-variant">
        Cargando gráfica...
      </div>
    ),
  }
);

const ExpenseDonutChart = dynamic(
  () => import("@/components/dashboard/ExpenseDonutChart").then((mod) => mod.ExpenseDonutChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-56 animate-pulse bg-surface-container-low rounded-2xl flex items-center justify-center text-sm text-on-surface-variant">
        Cargando gráfica...
      </div>
    ),
  }
);

export default function DashboardPage() {
  const now = new Date();
  const [period, setPeriod] = useState<MonthYear>({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  // Mes anterior para tendencias
  const prevMonth = period.month === 1
    ? { month: 12, year: period.year - 1 }
    : { month: period.month - 1, year: period.year };

  const { entries: ingresos, loading: loadingI, totalMes: totalIngresos } = useIngresos(period.year, period.month);
  const { entries: gastos, loading: loadingG, totalMes: totalGastos } = useGastos(period.year, period.month);
  const { totalMes: totalIngresosAnterior } = useIngresos(prevMonth.year, prevMonth.month);
  const { totalMes: totalGastosAnterior } = useGastos(prevMonth.year, prevMonth.month);
  const { categories } = useCategories("expense");
  const { preferences } = useUserPreferences();

  const prefs = preferences ?? { ...DEFAULT_PREFERENCES, date_format: "DD/MM/YYYY" };
  const loading = loadingI || loadingG;

  const kpis = calcularKPIs(totalIngresos, totalGastos, totalIngresosAnterior, totalGastosAnterior);

  const flatCategories: Category[] = categories.flatMap((c) => [c, ...(c.children ?? [])]);
  const ruleBlocks = calcularBloques(totalIngresos, gastos, flatCategories);
  const categoryBreakdown = calcularPorcentajePorCategoria(gastos, flatCategories);

  const { data: historyData, loading: loadingHistory } = useMonthlyHistory(period);

  // Últimas 5 transacciones combinadas
  const allMovements = [
    ...ingresos.map((e) => ({ ...e, entryType: "income" as const })),
    ...gastos.map((e) => ({ ...e, entryType: "expense" as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  // SVG circular para % ahorro
  const pctAhorro = Math.max(0, Math.min(kpis.pctAhorro, 100));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pctAhorro / 100) * circumference;

  return (
    <div className="py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-headline text-on-surface tracking-tight">Resumen</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Vista general de tus finanzas</p>
        </div>
        <MonthSelector value={period} onChange={setPeriod} />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Ingresos del mes"
          value={loading ? "—" : formatCurrency(kpis.ingresosMes, prefs)}
          icon="payments"
          iconBg="bg-secondary/10"
          trend={kpis.tendenciaIngresos}
        />
        <KPICard
          label="Gastos del mes"
          value={loading ? "—" : formatCurrency(kpis.gastosMes, prefs)}
          icon="receipt_long"
          iconBg="bg-error/10"
          trend={kpis.tendenciaGastos}
        />
        <KPICard
          label="Ahorro generado"
          value={loading ? "—" : formatCurrency(kpis.ahorroGenerado, prefs)}
          icon="savings"
          iconBg="bg-tertiary/10"
          trend={kpis.tendenciaAhorro}
        />

        {/* Card % ahorro — dark */}
        <KPICard
          label="Tasa de ahorro"
          value={loading ? "—" : `${Math.max(0, kpis.pctAhorro).toFixed(1)}%`}
          icon="donut_large"
          dark
        >
          {/* Mini progress arc */}
          <div className="flex justify-center mt-1">
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle
                cx="44" cy="44" r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="6"
              />
              <circle
                cx="44" cy="44" r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 44 44)"
              />
              <text
                x="44" y="49"
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontWeight="800"
                fontFamily="Manrope, sans-serif"
              >
                {Math.max(0, kpis.pctAhorro).toFixed(0)}%
              </text>
            </svg>
          </div>
        </KPICard>
      </div>

      {/* Regla 50/30/20 mini */}
      {!loading && <Rule503020Mini blocks={ruleBlocks} preferences={preferences} />}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <CashFlowChart data={historyData} loading={loadingHistory} preferences={preferences} />
        </div>
        <div className="lg:col-span-2">
          <ExpenseDonutChart
            data={categoryBreakdown}
            total={totalGastos}
            loading={loading}
            preferences={preferences}
          />
        </div>
      </div>

      {/* Últimas transacciones */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-[0_2px_12px_rgba(25,28,30,0.06)] overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant/10">
          <h2 className="font-headline font-bold text-on-surface">Últimas transacciones</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">5 movimientos más recientes del mes</p>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-on-surface-variant">
            Cargando movimientos...
          </div>
        ) : allMovements.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-outline-variant">inbox</span>
            <p className="text-sm text-on-surface-variant mt-2">Sin movimientos este mes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="text-left">
                <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Concepto</th>
                <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {allMovements.map((mov) => (
                <tr key={`${mov.entryType}-${mov.id}`} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-on-surface-variant whitespace-nowrap">
                    {formatDate(mov.date, prefs.date_format)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-on-surface">
                    {mov.concept}
                  </td>
                  <td className="px-6 py-4">
                    {mov.category ? (
                      <CategoryBadge
                        categoryName={mov.category.name}
                        type={mov.entryType}
                      />
                    ) : (
                      <span className="text-sm text-on-surface-variant">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`text-sm font-bold font-headline ${
                        mov.entryType === "income" ? "text-secondary" : "text-error"
                      }`}
                    >
                      {mov.entryType === "income" ? "+" : "-"}
                      {formatCurrency(mov.amount, prefs)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
