"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency, DEFAULT_PREFERENCES } from "@/lib/utils/formatCurrency";
import type { MonthlyPoint } from "@/hooks/useMonthlyHistory";
import type { UserPreferences } from "@/types";

interface CashFlowChartProps {
  data: MonthlyPoint[];
  loading?: boolean;
  preferences?: UserPreferences | null;
}

type FormatPrefs = Pick<UserPreferences, "currency_symbol" | "symbol_position" | "decimal_format">;

function CustomTooltip({
  active,
  payload,
  label,
  prefs,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  prefs: FormatPrefs;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="gradient-primary rounded-xl px-4 py-3 shadow-xl text-on-primary text-xs min-w-[140px]">
      <p className="font-bold font-headline mb-2 text-on-primary/70">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-black font-headline">{formatCurrency(p.value, prefs)}</span>
        </div>
      ))}
    </div>
  );
}

export function CashFlowChart({ data, loading, preferences }: CashFlowChartProps) {
  const prefs = preferences ?? DEFAULT_PREFERENCES;

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-[0_2px_12px_rgba(25,28,30,0.06)] overflow-hidden">
      <div className="px-6 py-5 border-b border-outline-variant/10">
        <h2 className="font-headline font-bold text-slate-900">Flujo de caja</h2>
        <p className="text-xs text-on-surface-variant mt-0.5">Ingresos vs gastos — últimos 6 meses</p>
      </div>

      <div className="px-4 py-5">
        {loading ? (
          <div className="h-56 flex items-center justify-center text-sm text-on-surface-variant">
            Cargando gráfica...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={224}>
            <BarChart data={data} barGap={4} barCategoryGap="28%">
              <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.04)" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#8192a7", fontFamily: "Inter, sans-serif" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#8192a7", fontFamily: "Inter, sans-serif" }}
                tickFormatter={(v: number) => formatCurrency(v, prefs)}
                width={72}
              />
              <Tooltip
                content={<CustomTooltip prefs={prefs} />}
                cursor={{ fill: "rgba(0,0,0,0.03)", radius: 8 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 16, fontFamily: "Inter, sans-serif" }}
              />
              <Bar dataKey="ingresos" name="Ingresos" fill="#006c4a" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <Bar dataKey="gastos"   name="Gastos"   fill="#041627" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
