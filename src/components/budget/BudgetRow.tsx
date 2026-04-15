import { cn } from "@/lib/utils";
import type { CategoryWithChildren } from "@/types";

interface BudgetRowProps {
  category: CategoryWithChildren;
  amount: number;
  onChange: (categoryId: string, value: number) => void;
}

export function BudgetRow({ category, amount, onChange }: BudgetRowProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    onChange(category.id, isNaN(val) ? 0 : val);
  }

  const blockColor =
    category.rule_block === "needs"
      ? "bg-secondary/10 text-secondary"
      : "bg-tertiary/10 text-tertiary";

  return (
    <tr className="hover:bg-surface-container-low/40 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900">{category.name}</span>
            {category.children && category.children.length > 0 && (
              <span className="text-xs text-on-surface-variant mt-0.5">
                {category.children.map((c) => c.name).join(" · ")}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        {category.rule_block && (
          <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", blockColor)}>
            {category.rule_block === "needs" ? "Necesidades" : "Deseos"}
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount === 0 ? "" : amount}
            placeholder="0,00"
            onChange={handleChange}
            className="w-28 text-right text-sm font-bold font-headline text-slate-900 bg-surface-container-low rounded-lg px-3 py-2 border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          />
          <span className="text-sm text-on-surface-variant ml-1">€</span>
        </div>
      </td>
    </tr>
  );
}
