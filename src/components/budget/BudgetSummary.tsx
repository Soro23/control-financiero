import { formatCurrency, DEFAULT_PREFERENCES } from "@/lib/utils/formatCurrency";
import type { CategoryWithChildren, UserPreferences } from "@/types";

interface BudgetSummaryProps {
  categories: CategoryWithChildren[];
  amounts: Record<string, number>;
  preferences?: UserPreferences | null;
}

export function BudgetSummary({ categories, amounts, preferences }: BudgetSummaryProps) {
  const prefs = preferences ?? { ...DEFAULT_PREFERENCES, date_format: "DD/MM/YYYY" };

  const total = Object.values(amounts).reduce((s, v) => s + v, 0);

  const needsCats = categories.filter((c) => c.rule_block === "needs");
  const wantsCats = categories.filter((c) => c.rule_block === "wants");

  const totalNeeds = needsCats.reduce((s, c) => s + (amounts[c.id] ?? 0), 0);
  const totalWants = wantsCats.reduce((s, c) => s + (amounts[c.id] ?? 0), 0);

  return (
    <div className="px-6 py-5 bg-surface-container-low/30 border-t border-outline-variant/10">
      <div className="flex items-center justify-between gap-6">
        <div className="flex gap-8">
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Necesidades</p>
            <p className="text-lg font-black font-headline text-secondary mt-0.5">
              {formatCurrency(totalNeeds, prefs)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Deseos</p>
            <p className="text-lg font-black font-headline text-tertiary mt-0.5">
              {formatCurrency(totalWants, prefs)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total presupuestado</p>
          <p className="text-2xl font-black font-headline text-slate-900 mt-0.5">
            {formatCurrency(total, prefs)}
          </p>
        </div>
      </div>
    </div>
  );
}
