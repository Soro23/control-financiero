export interface UserPreferences {
  id: string;
  user_id: string;
  name: string | null;
  currency: string;
  currency_symbol: string;
  symbol_position: "before" | "after";
  decimal_format: "comma" | "dot";
  date_format: string;
  theme: "light" | "dark" | "system";
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string | null;
  type: "income" | "expense";
  name: string;
  parent_id: string | null;
  rule_block: "needs" | "wants" | "savings" | null;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface CategoryWithChildren extends Category {
  children?: Category[];
}

export interface IncomeEntry {
  id: string;
  user_id: string;
  category_id: string;
  concept: string;
  amount: number;
  date: string;
  is_recurring: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joins
  category?: Category;
}

export interface ExpenseEntry {
  id: string;
  user_id: string;
  category_id: string;
  subcategory_id: string | null;
  concept: string;
  amount: number;
  date: string;
  is_recurring: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joins
  category?: Category;
  subcategory?: Category;
}

// ─── Forms ───────────────────────────────────────────────────

export type RecurrenceFrequency = "weekly" | "biweekly" | "monthly" | "bimonthly" | "quarterly" | "yearly";

export interface IncomeFormData {
  concept: string;
  category_id: string;
  amount: number;
  date: string;
  is_recurring: boolean;
  recurrence_frequency?: RecurrenceFrequency | null;
  recurrence_end_date?: string | null;
  notes?: string;
}

export interface ExpenseFormData {
  concept: string;
  category_id: string;
  subcategory_id?: string;
  amount: number;
  date: string;
  is_recurring: boolean;
  recurrence_frequency?: RecurrenceFrequency | null;
  recurrence_end_date?: string | null;
  notes?: string;
}

// ─── Dashboard ───────────────────────────────────────────────

export interface MonthYear {
  month: number; // 1-12
  year: number;
}

export interface Trend {
  pct: number;
  amount: number;
  direction: "up" | "down" | "neutral";
}

export interface DashboardKPIs {
  ingresosMes: number;
  gastosMes: number;
  ahorroGenerado: number;
  pctAhorro: number;
  tendenciaIngresos: Trend;
  tendenciaGastos: Trend;
  tendenciaAhorro: Trend;
}

// ─── Calculations ────────────────────────────────────────────

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  total: number;
  pct: number;
}

// ─── Budget ──────────────────────────────────────────────────

export interface BudgetDoc {
  entries: Record<string, number>; // categoryId → amount
  updated_at: string;
}

// ─── Tracking ────────────────────────────────────────────────

export interface TrackingEntry {
  categoryId: string;
  categoryName: string;
  ruleBlock: "needs" | "wants" | "savings" | null;
  budgeted: number;
  actual: number;
  pct: number;
  status: "good" | "warning" | "over";
}

// ─── Rule 50/30/20 ───────────────────────────────────────────

export interface RuleBlock {
  actual: number;
  ideal: number;
  pct: number;
  status: "ok" | "warning" | "over";
}

export interface EmergencyFund {
  target: number;
  saved: number;
  progress: number;
}

export interface RuleBlocks {
  needs: RuleBlock;
  wants: RuleBlock;
  savings: RuleBlock;
  totalIngresos: number;
  emergencyFund?: EmergencyFund;
}

// ─── Insights ────────────────────────────────────────────────

export interface Insight {
  type: "success" | "warning" | "danger";
  message: string;
}

// ─── Saving Goals ─────────────────────────────────────────────

export interface SavingGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  accumulated: number;
  current_amount: number;
  is_emergency_fund: boolean;
  deadline: string | null;
  monthly_contribution: number | null;
  icon: string;
  color: "primary" | "secondary" | "tertiary" | "error";
  created_at: string;
  updated_at: string;
}

export interface SavingGoalFormData {
  name: string;
  target_amount: number;
  deadline?: string;
  monthly_contribution?: number;
  icon: string;
  color: "primary" | "secondary" | "tertiary" | "error";
  is_emergency_fund?: boolean;
}

export interface GoalCalculations {
  progress: number;              // 0–100
  remaining: number;
  monthsLeft: number | null;
  estimatedDate: Date | null;
  requiredMonthly: number | null;
}

// ─── Alerts ─────────────────────────────────────────────

export interface Alert {
  id: string;
  user_id: string;
  type: "budget_over" | "recurring_due" | "goal_reminder" | "emergency_fund" | "system";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AlertFormData {
  type: Alert["type"];
  title: string;
  message: string;
}
