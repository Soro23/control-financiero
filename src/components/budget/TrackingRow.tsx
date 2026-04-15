import { ProgressBar } from "@/components/shared/ProgressBar";
import { formatCurrency, DEFAULT_PREFERENCES } from "@/lib/utils/formatCurrency";
import { cn } from "@/lib/utils";
import type { TrackingEntry, UserPreferences } from "@/types";

interface TrackingRowProps {
  entry: TrackingEntry;
  preferences?: UserPreferences | null;
}

export function TrackingRow({ entry, preferences }: TrackingRowProps) {
  const prefs = preferences ?? { ...DEFAULT_PREFERENCES, date_format: "DD/MM/YYYY" };

  const statusColor = {
    good: "text-secondary",
    warning: "text-primary",
    over: "text-error",
  }[entry.status];

  const statusIcon = {
    good: "check_circle",
    warning: "warning",
    over: "error",
  }[entry.status];

  const blockLabel =
    entry.ruleBlock === "needs"
      ? "Necesidades"
      : entry.ruleBlock === "wants"
      ? "Deseos"
      : null;

  return (
    <tr className="hover:bg-surface-container-low/40 transition-colors">
      <td className="px-6 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-slate-900">{entry.categoryName}</span>
          {blockLabel && (
            <span className="text-xs text-on-surface-variant">{blockLabel}</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">
        {entry.budgeted > 0 ? formatCurrency(entry.budgeted, prefs) : <span className="text-outline-variant">—</span>}
      </td>
      <td className="px-6 py-4 text-sm font-bold font-headline text-slate-900">
        {formatCurrency(entry.actual, prefs)}
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1.5 min-w-[120px]">
          <ProgressBar value={entry.pct} color="auto" />
          <span className="text-xs text-on-surface-variant">
            {entry.budgeted > 0 ? `${Math.min(entry.pct, 999).toFixed(0)}%` : "Sin presupuesto"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className={cn("flex items-center justify-end gap-1", statusColor)}>
          <span className="material-symbols-outlined text-[16px] fill-icon">{statusIcon}</span>
          <span className="text-xs font-bold">
            {entry.budgeted > 0
              ? entry.actual > entry.budgeted
                ? `+${formatCurrency(entry.actual - entry.budgeted, prefs)}`
                : `-${formatCurrency(entry.budgeted - entry.actual, prefs)}`
              : "—"}
          </span>
        </div>
      </td>
    </tr>
  );
}
