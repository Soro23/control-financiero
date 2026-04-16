import type { ExpenseEntry, Category, RuleBlock, RuleBlocks, SavingGoal } from "@/types";

function buildBlock(actual: number, idealPct: number, totalIngresos: number): RuleBlock {
  const ideal = totalIngresos * (idealPct / 100);
  const pct = ideal > 0 ? (actual / ideal) * 100 : actual > 0 ? 100 : 0;
  const status: RuleBlock["status"] = pct < 80 ? "ok" : pct < 100 ? "warning" : "over";
  return { actual, ideal, pct, status };
}

function calculateEmergencyFundTarget(monthlyExpenses: number, monthsTarget: number = 6): number {
  return monthlyExpenses * monthsTarget;
}

export function calcularBloques(
  totalIngresos: number,
  gastos: ExpenseEntry[],
  categories: Category[],
  goals?: SavingGoal[]
): RuleBlocks {
  const catMap: Record<string, Category> = Object.fromEntries(categories.map((c) => [c.id, c]));

  let needs = 0;
  let wants = 0;

  for (const g of gastos) {
    const subcat = g.subcategory_id ? catMap[g.subcategory_id] : undefined;
    const cat = catMap[g.category_id];
    const parentCat = cat?.parent_id ? catMap[cat.parent_id] : undefined;

    const block = subcat?.rule_block ?? cat?.rule_block ?? parentCat?.rule_block;

    if (block === "needs") needs += g.amount;
    else wants += g.amount;
  }

  const totalGastos = needs + wants;
  const savings = Math.max(0, totalIngresos - totalGastos);

  // Emergency fund calculation
  const monthlyExpenses = totalGastos;
  const emergencyFundTarget = calculateEmergencyFundTarget(monthlyExpenses);
  const emergencyFundSaved = goals
    ? goals.filter(g => g.is_emergency_fund).reduce((s, g) => s + g.current_amount, 0)
    : 0;
  const emergencyFundProgress = emergencyFundTarget > 0 ? (emergencyFundSaved / emergencyFundTarget) * 100 : 0;

  return {
    needs: buildBlock(needs, 50, totalIngresos),
    wants: buildBlock(wants, 30, totalIngresos),
    savings: buildBlock(savings, 20, totalIngresos),
    totalIngresos,
    emergencyFund: {
      target: emergencyFundTarget,
      saved: emergencyFundSaved,
      progress: Math.min(100, emergencyFundProgress),
    },
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
  const { needs, wants, savings, emergencyFund } = blocks;

  const ef = emergencyFund;
  if (ef && ef.progress < 100) {
    const months = Math.round(ef.saved / (ef.target / 6));
    if (ef.progress === 0) {
      return "Prioridad #1: construye tu fondo de emergencia (3-6 meses de gastos). Este dinero debe ser líquido y accesible.";
    }
    if (ef.progress < 25) {
      return `Tienes ${Math.round(ef.progress)}% del fondo de emergencia. ¡Sigue así! Meta: 3-6 meses de gastos esenciales.`;
    }
    if (ef.progress < 50) {
      return `Ya tienes ${Math.round(ef.progress)}% del fondo de emergencia (~${months} meses). Continúa priorizando questo hasta completar 3-6 meses.`;
    }
    return `¡Excelente progreso! tienes ~${months} meses de reserva. Una vez completado, enfócate en inversiones a largo plazo.`;
  }

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
