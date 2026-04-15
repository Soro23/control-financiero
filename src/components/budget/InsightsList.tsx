import { cn } from "@/lib/utils";
import type { Insight } from "@/types";

interface InsightsListProps {
  insights: Insight[];
}

const ICON: Record<Insight["type"], string> = {
  success: "check_circle",
  warning: "warning",
  danger: "error",
};

const COLOR: Record<Insight["type"], string> = {
  success: "bg-secondary/8 border-secondary/20 text-secondary",
  warning: "bg-primary/5 border-primary/15 text-primary",
  danger: "bg-error/8 border-error/20 text-error",
};

export function InsightsList({ insights }: InsightsListProps) {
  if (insights.length === 0) {
    return (
      <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-secondary/5 border border-secondary/15">
        <span className="material-symbols-outlined text-[20px] fill-icon text-secondary">check_circle</span>
        <p className="text-sm text-secondary font-medium">Todo bajo control. Sin alertas este mes.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {insights.map((insight, i) => (
        <div
          key={i}
          className={cn(
            "flex items-start gap-3 px-5 py-4 rounded-xl border",
            COLOR[insight.type]
          )}
        >
          <span className="material-symbols-outlined text-[20px] fill-icon shrink-0 mt-0.5">
            {ICON[insight.type]}
          </span>
          <p className="text-sm font-medium">{insight.message}</p>
        </div>
      ))}
    </div>
  );
}
