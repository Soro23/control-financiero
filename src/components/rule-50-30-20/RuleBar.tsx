import { cn } from "@/lib/utils";
import { formatCurrency, DEFAULT_PREFERENCES } from "@/lib/utils/formatCurrency";
import type { RuleBlock, UserPreferences } from "@/types";

interface RuleBarProps {
  label: string;
  idealPct: number;
  block: RuleBlock;
  color: "needs" | "wants" | "savings";
  preferences?: UserPreferences | null;
}

const COLOR_MAP = {
  needs: {
    bg: "bg-secondary",
    light: "bg-secondary/15",
    text: "text-secondary",
    badge: "bg-secondary/10 text-secondary",
  },
  wants: {
    bg: "bg-tertiary",
    light: "bg-tertiary/15",
    text: "text-tertiary",
    badge: "bg-tertiary/10 text-tertiary",
  },
  savings: {
    bg: "bg-primary",
    light: "bg-primary/15",
    text: "text-primary",
    badge: "bg-primary/10 text-primary",
  },
};

const STATUS_COLOR: Record<RuleBlock["status"], string> = {
  ok: "text-secondary",
  warning: "text-primary",
  over: "text-error",
};

export function RuleBar({ label, idealPct, block, color, preferences }: RuleBarProps) {
  const prefs = preferences ?? { ...DEFAULT_PREFERENCES, date_format: "DD/MM/YYYY" };
  const c = COLOR_MAP[color];
  const clampedPct = Math.min(block.pct, 100);

  // Marker position clamped between 5% and 95% to stay visible
  const markerPct = Math.min(Math.max(block.pct, 0), 100);

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={cn("text-sm font-bold", c.text)}>{label}</span>
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", c.badge)}>
            Ideal {idealPct}%
          </span>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-xs text-on-surface-variant">Real</p>
            <p className="text-sm font-black font-headline text-slate-900">
              {formatCurrency(block.actual, prefs)}
            </p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant">Objetivo</p>
            <p className="text-sm font-medium text-on-surface-variant">
              {formatCurrency(block.ideal, prefs)}
            </p>
          </div>
          <div className={cn("text-right", STATUS_COLOR[block.status])}>
            <p className="text-xs">Uso</p>
            <p className="text-sm font-black font-headline">{block.pct.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {/* Bar with ideal marker */}
      <div className="relative h-3 rounded-full overflow-visible">
        {/* Track */}
        <div className={cn("w-full h-full rounded-full", c.light)} />

        {/* Fill */}
        <div
          className={cn(
            "absolute top-0 left-0 h-full rounded-full transition-all duration-700",
            block.status === "over" ? "bg-error" : c.bg
          )}
          style={{ width: `${clampedPct}%` }}
        />

        {/* Ideal marker (100% of block = 100% full) — shown as a vertical line at 100% */}
        {/* We show the "ideal" as the full bar, so the marker for over is at 100% */}
        {block.pct > 100 && (
          <div
            className="absolute top-0 h-full w-0.5 bg-white/80 rounded-full"
            style={{ left: `${Math.min((100 / block.pct) * clampedPct, 99)}%` }}
          />
        )}
      </div>

      {/* Over-budget indicator */}
      {block.status !== "ok" && (
        <p className={cn("text-xs font-medium", STATUS_COLOR[block.status])}>
          {block.status === "over"
            ? `Excede el objetivo en ${formatCurrency(block.actual - block.ideal, prefs)}`
            : `Cerca del límite — quedan ${formatCurrency(block.ideal - block.actual, prefs)}`}
        </p>
      )}
    </div>
  );
}
