import type { Category, ExpenseEntry, TrackingEntry, Insight } from "@/types";

export function getTrackingStatus(pct: number): "good" | "warning" | "over" {
  if (pct < 80) return "good";
  if (pct < 100) return "warning";
  return "over";
}

export function buildTrackingData(
  categories: Category[],
  budgetEntries: Record<string, number>,
  gastos: ExpenseEntry[]
): TrackingEntry[] {
  // Only parent expense categories
  const parentCats = categories.filter(
    (c) => c.type === "expense" && c.parent_id === null && c.is_active
  );

  return parentCats
    .map((cat) => {
      const budgeted = budgetEntries[cat.id] ?? 0;

      // Sum gastos for this category AND its subcategories
      const actual = gastos
        .filter((g) => g.category_id === cat.id || g.subcategory_id === cat.id ||
          // also match when parent of subcategory matches
          categories.find((c) => c.id === g.category_id)?.parent_id === cat.id
        )
        .reduce((sum, g) => sum + g.amount, 0);

      const pct = budgeted > 0 ? (actual / budgeted) * 100 : actual > 0 ? 100 : 0;

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        ruleBlock: cat.rule_block,
        budgeted,
        actual,
        pct,
        status: getTrackingStatus(pct),
      };
    })
    .sort((a, b) => b.actual - a.actual);
}

export function generateInsights(tracking: TrackingEntry[]): Insight[] {
  const insights: Insight[] = [];

  const overBudget = tracking.filter((t) => t.status === "over" && t.budgeted > 0);
  const nearBudget = tracking.filter((t) => t.status === "warning" && t.budgeted > 0);
  const underBudget = tracking.filter((t) => t.pct < 50 && t.budgeted > 0 && t.actual > 0);
  const unbudgeted = tracking.filter((t) => t.budgeted === 0 && t.actual > 0);

  for (const t of overBudget) {
    const excess = t.actual - t.budgeted;
    insights.push({
      type: "danger",
      message: `${t.categoryName} ha superado el presupuesto en ${excess.toFixed(2)} €`,
    });
  }

  for (const t of nearBudget) {
    insights.push({
      type: "warning",
      message: `${t.categoryName} está al ${t.pct.toFixed(0)}% del presupuesto — quedan ${(t.budgeted - t.actual).toFixed(2)} €`,
    });
  }

  for (const t of underBudget) {
    insights.push({
      type: "success",
      message: `${t.categoryName} lleva solo el ${t.pct.toFixed(0)}% — buen control del gasto`,
    });
  }

  for (const t of unbudgeted) {
    insights.push({
      type: "warning",
      message: `${t.categoryName} tiene gastos (${t.actual.toFixed(2)} €) pero no tiene presupuesto asignado`,
    });
  }

  return insights;
}
