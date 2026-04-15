import type { IncomeEntry, Category, CategoryBreakdown, Trend } from "@/types";

export function calcularTotalMes(entries: IncomeEntry[]): number {
  return entries.reduce((sum, e) => sum + e.amount, 0);
}

export function calcularPorcentajePorCategoria(
  entries: IncomeEntry[],
  categories: Category[]
): CategoryBreakdown[] {
  const total = calcularTotalMes(entries);
  if (total === 0) return [];

  const totalesPorCat: Record<string, number> = {};

  for (const entry of entries) {
    totalesPorCat[entry.category_id] =
      (totalesPorCat[entry.category_id] ?? 0) + entry.amount;
  }

  return Object.entries(totalesPorCat).map(([categoryId, catTotal]) => {
    const category = categories.find((c) => c.id === categoryId);
    return {
      categoryId,
      categoryName: category?.name ?? "Sin categoría",
      total: catTotal,
      pct: (catTotal / total) * 100,
    };
  }).sort((a, b) => b.total - a.total);
}

export function calcularVariacion(actual: number, anterior: number): Trend {
  if (anterior === 0) {
    return { pct: actual > 0 ? 100 : 0, amount: actual, direction: actual > 0 ? "up" : "neutral" };
  }

  const amount = actual - anterior;
  const pct = Math.abs((amount / anterior) * 100);
  const direction = amount > 0 ? "up" : amount < 0 ? "down" : "neutral";

  return { pct, amount, direction };
}
