import type { SavingGoal, GoalCalculations } from "@/types";

export function calcularProgreso(accumulated: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min((accumulated / target) * 100, 100);
}

export function calcularMesesRestantes(
  remaining: number,
  monthlyContribution: number
): number | null {
  if (monthlyContribution <= 0) return null;
  return Math.ceil(remaining / monthlyContribution);
}

export function calcularFechaEstimada(monthsLeft: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsLeft);
  return date;
}

export function calcularAportacionNecesaria(
  remaining: number,
  deadline: string
): number | null {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  if (diffMs <= 0) return null;
  const months = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30.44));
  if (months <= 0) return null;
  return remaining / months;
}

export function calcularGoal(goal: SavingGoal): GoalCalculations {
  const remaining = Math.max(0, goal.target_amount - goal.accumulated);
  const progress = calcularProgreso(goal.accumulated, goal.target_amount);

  // Required monthly from deadline
  const requiredMonthly = goal.deadline
    ? calcularAportacionNecesaria(remaining, goal.deadline)
    : null;

  // Months left: use deadline if set, else use monthly_contribution
  const contribution = goal.monthly_contribution ?? requiredMonthly ?? 0;
  const monthsLeft = calcularMesesRestantes(remaining, contribution);
  const estimatedDate = monthsLeft !== null ? calcularFechaEstimada(monthsLeft) : null;

  return { progress, remaining, monthsLeft, estimatedDate, requiredMonthly };
}
