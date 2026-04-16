"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MonthSelector } from "@/components/shared/MonthSelector";
import { MovementsTable } from "@/components/movements/MovementsTable";
import { MovementModal } from "@/components/movements/MovementModal";
import { useIngresos } from "@/hooks/useIngresos";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { calcularTotalMes } from "@/lib/calculations/ingresos";
import { formatCurrency, DEFAULT_PREFERENCES } from "@/lib/utils/formatCurrency";
import { exportToXlsx } from "@/lib/export/exportToXlsx";
import { useRouter } from "next/navigation";
import type { MonthYear } from "@/types";

export default function IngresosPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center">Cargando...</div>}>
      <IngresosContent />
    </Suspense>
  );
}

function IngresosContent() {
  const router = useRouter();
  const now = new Date();
  const [period, setPeriod] = useState<MonthYear>({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
  const [modalOpen, setModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const prevMonth = period.month === 1
    ? { month: 12, year: period.year - 1 }
    : { month: period.month - 1, year: period.year };

  const { entries, loading, loadingMore, hasMore, refetch, loadMore, deleteIngreso } = useIngresos(period.year, period.month);
  const { entries: ingresosAnterior } = useIngresos(prevMonth.year, prevMonth.month);
  const { preferences } = useUserPreferences();

  useEffect(() => {
    const handleMovementUpdated = () => refetch();
    window.addEventListener("movement-updated", handleMovementUpdated);
    return () => window.removeEventListener("movement-updated", handleMovementUpdated);
  }, [refetch]);

  const prefs = preferences ?? DEFAULT_PREFERENCES;

  const normalizeText = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredEntries = useMemo(() => {
    if (!searchQuery) return entries;
    const q = normalizeText(searchQuery);
    return entries.filter(e =>
      normalizeText(e.concept || "").includes(q) ||
      normalizeText(e.notes || "").includes(q)
    );
  }, [entries, searchQuery]);

  const totalMes = calcularTotalMes(filteredEntries);
  const totalAnterior = calcularTotalMes(ingresosAnterior);

  return (
    <div className="py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-headline text-slate-900 tracking-tight">Ingresos</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {loading ? "Cargando..." : `${filteredEntries.length} movimiento${filteredEntries.length !== 1 ? "s" : ""} · ${formatCurrency(totalMes, prefs)} total`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <MonthSelector value={period} onChange={setPeriod} />
          <button
            onClick={() => exportToXlsx("ingresos", { ingresos: entries, month: period.month, year: period.year })}
            disabled={entries.length === 0}
            title="Exportar a Excel"
            className="flex items-center gap-2 bg-surface-container-lowest text-slate-600 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-surface-container border border-outline-variant/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="hidden sm:inline">Exportar</span>
          </button>
          <button
            onClick={() => router.push("/importar")}
            title="Importar desde banco"
            className="flex items-center gap-2 bg-surface-container-lowest text-slate-600 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-surface-container border border-outline-variant/20 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">upload</span>
            <span className="hidden sm:inline">Importar</span>
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 gradient-primary text-on-primary px-5 py-2.5 rounded-xl font-bold font-headline text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/10"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="hidden sm:inline">Nuevo Ingreso</span>
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_2px_12px_rgba(25,28,30,0.06)]">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Total del mes</p>
          <p className="text-2xl font-black font-headline text-secondary">{formatCurrency(totalMes, prefs)}</p>
          {totalAnterior > 0 && (
            <p className="text-xs text-on-surface-variant mt-1">
              vs {formatCurrency(totalAnterior, prefs)} mes anterior
            </p>
          )}
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_2px_12px_rgba(25,28,30,0.06)]">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Movimientos</p>
          <p className="text-2xl font-black font-headline text-slate-900">{entries.length}</p>
          <p className="text-xs text-on-surface-variant mt-1">registros este mes</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_2px_12px_rgba(25,28,30,0.06)]">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Mayor ingreso</p>
          <p className="text-2xl font-black font-headline text-slate-900">
            {entries.length > 0
              ? formatCurrency(Math.max(...entries.map((e) => e.amount)), prefs)
              : "—"}
          </p>
          <p className="text-xs text-on-surface-variant mt-1">
            {entries.length > 0
              ? entries.reduce((max, e) => e.amount > max.amount ? e : max, entries[0]).concept
              : "Sin datos"}
          </p>
        </div>
      </div>

      {/* Table */}
      <MovementsTable
        type="income"
        entries={filteredEntries}
        preferences={preferences ? { ...preferences, date_format: preferences.date_format } : null}
        onDelete={deleteIngreso}
        onRefresh={refetch}
        loadMore={loadMore}
        loadingMore={loadingMore}
        hasMore={hasMore}
      />

      <MovementModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultType="income"
        onSuccess={refetch}
      />
    </div>
  );
}
