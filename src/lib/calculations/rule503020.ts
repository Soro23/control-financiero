import type { ExpenseEntry, Category, RuleBlock, RuleBlocks } from "@/types";

function buildBlock(actual: number, idealPct: number, totalIngresos: number): RuleBlock {
  const ideal = totalIngresos * (idealPct / 100);
  const pct = ideal > 0 ? (actual / ideal) * 100 : actual > 0 ? 100 : 0;
  const status: RuleBlock["status"] = pct < 80 ? "ok" : pct < 100 ? "warning" : "over";
  return { actual, ideal, pct, status };
}

export function calcularBloques(
  totalIngresos: number,
  gastos: ExpenseEntry[],
  categories: Category[]
): RuleBlocks {
  const catMap: Record<string, Category> = Object.fromEntries(categories.map((c) => [c.id, c]));

  let needs = 0;
  let wants = 0;
  // savings comes from goal contributions (Phase 3); for now derived from ingresos - gastos
  const savings = Math.max(0, totalIngresos - gastos.reduce((s, g) => s + g.amount, 0));

  for (const g of gastos) {
    // Determine rule_block: check subcategory first, then category, then parent of category
    const subcat = g.subcategory_id ? catMap[g.subcategory_id] : undefined;
    const cat = catMap[g.category_id];
    const parentCat = cat?.parent_id ? catMap[cat.parent_id] : undefined;

    const block = subcat?.rule_block ?? cat?.rule_block ?? parentCat?.rule_block;

    if (block === "needs") needs += g.amount;
    else wants += g.amount; // default unclassified to wants
  }

  return {
    needs: buildBlock(needs, 50, totalIngresos),
    wants: buildBlock(wants, 30, totalIngresos),
    savings: buildBlock(savings, 20, totalIngresos),
    totalIngresos,
  };
}

export function calcularDesviacion(
  real: number,
  ideal: number
): { valor: number; status: "ok" | "warning" | "over" } {
  const valor = real - ideal;
  const pct = ideal > 0 ? (real / ideal) * 100 : 0;
  const status: "ok" | "warning" | "over" = pct < 80 ? "ok" : pct < 100 ? "warning" : "over";
  return { valor, status };
}

export function generarInsightTexto(blocks: RuleBlocks): string {
  const { needs, wants, savings } = blocks;

  if (needs.status === "over" && wants.status === "over") {
    return "Necesidades y deseos superan lo recomendado. Revisa gastos fijos y reduce ocio para liberar ahorro.";
  }
  if (needs.status === "over") {
    return "Tus gastos esenciales superan el 50% recomendado. Busca optimizar vivienda, alimentación o transporte.";
  }
  if (wants.status === "over") {
    return "Gastas más del 30% en deseos. Reduce ocio o compras no esenciales para mejorar tu ahorro.";
  }
  if (savings.status === "over") {
    return "Excelente: estás ahorrando por encima del 20%. ¡Sigue así y alcanzarás tus objetivos antes!";
  }
  if (savings.pct < 50) {
    return "Tu tasa de ahorro es baja. Intenta reducir gastos en deseos para acercarte al 20% recomendado.";
  }
  return "Tus finanzas están bien equilibradas. Mantén el rumbo y sigue revisando mensualmente.";
}
