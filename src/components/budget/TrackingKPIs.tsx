import { formatCurrency, DEFAULT_PREFERENCES } from "@/lib/utils/formatCurrency";
import { cn } from "@/lib/utils";
import type { TrackingEntry, UserPreferences } from "@/types";

interface TrackingKPIsProps {
  entries: TrackingEntry[];
  preferences?: UserPreferences | null;
}

export function TrackingKPIs({ entries, preferences }: TrackingKPIsProps) {
  const prefs = preferences ?? { ...DEFAULT_PREFERENCES, date_format: "DD/MM/YYYY" };

  const totalBudgeted = entries.reduce((s, e) => s + e.budgeted, 0);
  const totalActual = entries.reduce((s, e) => s + e.actual, 0);
  const diferencia = totalBudgeted - totalActual;
  const isOver = diferencia < 0;

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Presupuestado */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-[0_2px_12px_rgba(25,28,30,0.06)] p-6">
        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[20px] text-primary">account_balance_wallet</span>
        </div>
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Presupuestado</p>
        <p className="text-2xl font-black font-headline text-slate-900 mt-1">
          {formatCurrency(totalBudgeted, prefs)}
        </p>
      </div>

      {/* Gastado */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-[0_2px_12px_rgba(25,28,30,0.06)] p-6">
        <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[20px] text-error">receipt_long</span>
        </div>
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Gastado</p>
        <p className="text-2xl font-black font-headline text-slate-900 mt-1">
          {formatCurrency(totalActual, prefs)}
        </p>
      </div>

      {/* Diferencia */}
      <div className={cn(
        "rounded-2xl p-6",
        isOver
          ? "bg-error/5 shadow-[0_2px_12px_rgba(186,26,26,0.08)]"
          : "bg-secondary/5 shadow-[0_2px_12px_rgba(0,108,74,0.08)]"
      )}>
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
          isOver ? "bg-error/10" : "bg-secondary/10"
        )}>
          <span className={cn(
            "material-symbols-outlined text-[20px]",
            isOver ? "text-error" : "text-secondary"
          )}>
            {isOver ? "trending_up" : "trending_down"}
          </span>
        </div>
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          {isOver ? "Exceso" : "Margen disponible"}
        </p>
        <p className={cn(
          "text-2xl font-black font-headline mt-1",
          isOver ? "text-error" : "text-secondary"
        )}>
          {isOver ? "+" : ""}{formatCurrency(Math.abs(diferencia), prefs)}
        </p>
      </div>
    </div>
  );
}
