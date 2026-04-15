import { TrackingRow } from "./TrackingRow";
import type { TrackingEntry, UserPreferences } from "@/types";

interface TrackingTableProps {
  entries: TrackingEntry[];
  preferences?: UserPreferences | null;
}

export function TrackingTable({ entries, preferences }: TrackingTableProps) {
  if (entries.length === 0) {
    return (
      <div className="py-16 text-center">
        <span className="material-symbols-outlined text-5xl text-outline-variant">monitoring</span>
        <p className="text-sm text-on-surface-variant mt-3">
          Sin datos de seguimiento. Añade gastos y presupuesto para ver el comparativo.
        </p>
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="text-left bg-surface-container-low/50">
          <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Categoría</th>
          <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Presupuestado</th>
          <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Real</th>
          <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Progreso</th>
          <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Diferencia</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/10">
        {entries.map((entry) => (
          <TrackingRow key={entry.categoryId} entry={entry} preferences={preferences} />
        ))}
      </tbody>
    </table>
  );
}
