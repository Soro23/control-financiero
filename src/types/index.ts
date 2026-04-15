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

export interface IncomeFormData {
  concept: string;
  category_id: string;
  amount: number;
  date: string;
  is_recurring: boolean;
  notes?: string;
}

export interface ExpenseFormData {
  concept: string;
  category_id: string;
  subcategory_id?: string;
  amount: number;
  date: string;
  is_recurring: boolean;
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

export interface RuleBlocks {
  needs: RuleBlock;
  wants: RuleBlock;
  savings: RuleBlock;
  totalIngresos: number;
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
  deadline: string | null;       // YYYY-MM-DD or null
  monthly_contribution: number | null;
  icon: string;                  // Material Symbol name
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
}

export interface GoalCalculations {
  progress: number;              // 0–100
  remaining: number;
  monthsLeft: number | null;
  estimatedDate: Date | null;
  requiredMonthly: number | null;
}
