"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { formatCurrency, DEFAULT_PREFERENCES } from "@/lib/utils/formatCurrency";
import { formatDate } from "@/lib/utils/formatDate";
import { MovementModal } from "./MovementModal";
import type { IncomeEntry, ExpenseEntry, UserPreferences } from "@/types";

type PrefsSubset = Pick<UserPreferences, "currency_symbol" | "symbol_position" | "decimal_format" | "date_format">;

interface MovementsTableProps {
  type: "income" | "expense";
  entries: (IncomeEntry | ExpenseEntry)[];
  preferences: PrefsSubset | null;
  onDelete: (id: string) => Promise<boolean>;
  onRefresh: () => void;
}

export function MovementsTable({
  type,
  entries,
  preferences,
  onDelete,
  onRefresh,
}: MovementsTableProps) {
  const [editEntry, setEditEntry] = useState<IncomeEntry | ExpenseEntry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const prefs = preferences ?? { ...DEFAULT_PREFERENCES, date_format: "DD/MM/YYYY" };
  const total = entries.reduce((sum, e) => sum + e.amount, 0);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const ok = await onDelete(id);
    setDeletingId(null);
    if (!ok) toast.error("Error al eliminar el movimiento");
  }

  if (entries.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl shadow-[0_2px_12px_rgba(25,28,30,0.06)] py-16 text-center">
        <span className="material-symbols-outlined text-5xl text-outline-variant">inbox</span>
        <p className="text-sm text-on-surface-variant mt-3">
          Sin {type === "income" ? "ingresos" : "gastos"} este mes
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-surface-container-lowest rounded-2xl shadow-[0_2px_12px_rgba(25,28,30,0.06)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/10">
              <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Concepto</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Categoría</th>
              {type === "expense" && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Subcategoría</th>
              )}
              <th className="px-6 py-4 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Importe</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider">% Total</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {entries.map((entry) => {
              const pct = total > 0 ? (entry.amount / total) * 100 : 0;
              const expEntry = type === "expense" ? (entry as ExpenseEntry) : null;

              return (
                <tr key={entry.id} className="hover:bg-surface-container-low/40 transition-colors group">
                  <td className="px-6 py-4 text-sm text-on-surface-variant whitespace-nowrap">
                    {formatDate(entry.date, prefs.date_format)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">{entry.concept}</span>
                      {entry.is_recurring && (
                        <span className="material-symbols-outlined text-[14px] text-on-surface-variant" title="Recurrente">repeat</span>
                      )}
                    </div>
                    {entry.notes && (
                      <p className="text-xs text-on-surface-variant mt-0.5 truncate max-w-[200px]">{entry.notes}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {entry.category ? (
                      <CategoryBadge categoryName={entry.category.name} type={type} />
                    ) : (
                      <span className="text-sm text-on-surface-variant">—</span>
                    )}
                  </td>
                  {type === "expense" && (
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {expEntry?.subcategory?.name ?? "—"}
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-bold font-headline ${type === "income" ? "text-secondary" : "text-error"}`}>
                      {type === "income" ? "+" : "-"}{formatCurrency(entry.amount, prefs)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-on-surface-variant">
                    {pct.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      entry.is_recurring
                        ? "bg-primary/10 text-primary"
                        : "bg-surface-container-low text-on-surface-variant"
                    }`}>
                      {entry.is_recurring ? "Recurrente" : "Puntual"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditEntry(entry)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        disabled={deletingId === entry.id}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/5 transition-colors disabled:opacity-50"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editEntry && (
        <MovementModal
          open={!!editEntry}
          onOpenChange={(open) => { if (!open) setEditEntry(null); }}
          defaultType={type}
          onSuccess={() => { setEditEntry(null); onRefresh(); }}
        />
      )}
    </>
  );
}
