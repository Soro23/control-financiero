import { KPICard } from "@/components/shared/KPICard";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import type { UserPreferences } from "@/types";

type PrefsSubset = Pick<UserPreferences, "currency_symbol" | "symbol_position" | "decimal_format">;

interface SummaryCardsProps {
  type: "income" | "expense";
  totalMes: number;
  totalMesAnterior: number;
  preferences: PrefsSubset;
  loading: boolean;
}

export function SummaryCards({
  type,
  totalMes,
  totalMesAnterior,
  preferences,
  loading,
}: SummaryCardsProps) {
  const diff = totalMes - totalMesAnterior;
  const pct = totalMesAnterior > 0 ? Math.abs((diff / totalMesAnterior) * 100) : 0;
  const direction = diff > 0 ? "up" : diff < 0 ? "down" : "neutral";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <KPICard
        label={type === "income" ? "Total ingresos" : "Total gastos"}
        value={loading ? "—" : formatCurrency(totalMes, preferences)}
        icon={type === "income" ? "payments" : "receipt_long"}
        iconBg={type === "income" ? "bg-secondary/10" : "bg-error/10"}
        trend={{ pct, amount: diff, direction }}
      />
      <KPICard
        label="Número de movimientos"
        value={loading ? "—" : "—"}
        icon="list_alt"
        iconBg="bg-primary/5"
      />
      <KPICard
        label={type === "income" ? "Mayor ingreso" : "Mayor gasto"}
        value={loading ? "—" : "—"}
        icon={type === "income" ? "arrow_upward" : "arrow_downward"}
        iconBg={type === "income" ? "bg-secondary/5" : "bg-error/5"}
      />
    </div>
  );
}
