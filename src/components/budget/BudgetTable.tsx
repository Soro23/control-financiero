import { BudgetRow } from "./BudgetRow";
import type { CategoryWithChildren } from "@/types";

interface BudgetTableProps {
  categories: CategoryWithChildren[];
  amounts: Record<string, number>;
  onChange: (categoryId: string, value: number) => void;
}

export function BudgetTable({ categories, amounts, onChange }: BudgetTableProps) {
  if (categories.length === 0) {
    return (
      <div className="py-16 text-center">
        <span className="material-symbols-outlined text-5xl text-outline-variant">account_balance_wallet</span>
        <p className="text-sm text-on-surface-variant mt-3">No hay categorías de gastos disponibles</p>
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="text-left bg-surface-container-low/50">
          <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Categoría</th>
          <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Bloque</th>
          <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Importe mensual</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/10">
        {categories.map((cat) => (
          <BudgetRow
            key={cat.id}
            category={cat}
            amount={amounts[cat.id] ?? 0}
            onChange={onChange}
          />
        ))}
      </tbody>
    </table>
  );
}
