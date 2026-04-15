"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency, DEFAULT_PREFERENCES } from "@/lib/utils/formatCurrency";
import type { CategoryBreakdown, UserPreferences } from "@/types";

interface ExpenseDonutChartProps {
  data: CategoryBreakdown[];
  total: number;
  loading?: boolean;
  preferences?: UserPreferences | null;
}

type FormatPrefs = Pick<UserPreferences, "currency_symbol" | "symbol_position" | "decimal_format">;

const COLORS = ["#041627", "#006c4a", "#b7c8de", "#8192a7", "#1a2b3c", "#38485a", "#d2e4fb", "#0b1d2d"];

function CustomTooltip({
  active,
  payload,
  prefs,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: CategoryBreakdown }[];
  prefs: FormatPrefs;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="gradient-primary rounded-xl px-4 py-3 shadow-xl text-on-primary text-xs min-w-[160px]">
      <p className="font-bold font-headline text-on-primary/70 mb-1">{item.name}</p>
      <p className="font-black font-headline text-base">{formatCurrency(item.value, prefs)}</p>
      <p className="text-on-primary/60 mt-0.5">{item.payload.pct.toFixed(1)}% del total</p>
    </div>
  );
}

export function ExpenseDonutChart({ data, total, loading, preferences }: ExpenseDonutChartProps) {
  const prefs = preferences ?? DEFAULT_PREFERENCES;

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-[0_2px_12px_rgba(25,28,30,0.06)] overflow-hidden">
      <div className="px-6 py-5 border-b border-outline-variant/10">
        <h2 className="font-headline font-bold text-slate-900">Gastos por categoría</h2>
        <p className="text-xs text-on-surface-variant mt-0.5">Distribución del mes seleccionado</p>
      </div>

      <div className="px-4 py-5">
        {loading ? (
          <div className="h-56 flex items-center justify-center text-sm text-on-surface-variant">
            Cargando gráfica...
          </div>
        ) : data.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-on-surface-variant gap-2">
            <span className="material-symbols-outlined text-4xl text-outline-variant">donut_large</span>
            <p className="text-sm">Sin gastos este mes</p>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* Donut */}
            <div className="relative shrink-0">
              <ResponsiveContainer width={176} height={176}>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="total"
                    nameKey="categoryName"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {data.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip prefs={prefs} />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">Total</p>
                <p className="text-sm font-black font-headline text-slate-900 leading-tight">
                  {formatCurrency(total, prefs)}
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2 min-w-0 flex-1">
              {data.slice(0, 6).map((item, i) => (
                <div key={item.categoryId} className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-xs text-slate-700 truncate flex-1">{item.categoryName}</span>
                  <span className="text-xs font-bold text-slate-900 shrink-0">
                    {item.pct.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
