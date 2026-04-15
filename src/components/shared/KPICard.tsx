import { cn } from "@/lib/utils";
import type { Trend } from "@/types";

interface KPICardProps {
  label: string;
  value: string;
  icon: string;
  iconBg?: string;
  badge?: string;
  trend?: Trend;
  dark?: boolean;
  children?: React.ReactNode;
}

export function KPICard({
  label,
  value,
  icon,
  iconBg,
  badge,
  trend,
  dark = false,
  children,
}: KPICardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 flex flex-col gap-4",
        dark
          ? "gradient-primary text-on-primary"
          : "bg-surface-container-lowest shadow-[0_2px_12px_rgba(25,28,30,0.06)]"
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            dark ? "bg-white/10" : (iconBg ?? "bg-primary/5")
          )}
        >
          <span
            className={cn(
              "material-symbols-outlined text-[20px]",
              dark ? "text-on-primary" : "text-primary"
            )}
          >
            {icon}
          </span>
        </div>

        {badge && (
          <span
            className={cn(
              "text-xs font-bold px-2.5 py-1 rounded-full",
              dark
                ? "bg-white/15 text-on-primary"
                : "bg-surface-container-low text-on-surface-variant"
            )}
          >
            {badge}
          </span>
        )}

        {trend && !badge && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full",
              trend.direction === "up"
                ? dark
                  ? "bg-white/15 text-on-primary"
                  : "bg-secondary/10 text-secondary"
                : trend.direction === "down"
                ? dark
                  ? "bg-white/10 text-on-primary/80"
                  : "bg-error/10 text-error"
                : dark
                ? "bg-white/10 text-on-primary/70"
                : "bg-outline-variant/20 text-on-surface-variant"
            )}
          >
            <span className="material-symbols-outlined text-[14px]">
              {trend.direction === "up"
                ? "trending_up"
                : trend.direction === "down"
                ? "trending_down"
                : "trending_flat"}
            </span>
            {trend.pct.toFixed(1)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-wider mb-1",
            dark ? "text-on-primary/70" : "text-on-surface-variant"
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "text-2xl font-black font-headline tracking-tight",
            dark ? "text-on-primary" : "text-slate-900"
          )}
        >
          {value}
        </p>
      </div>

      {children}
    </div>
  );
}
