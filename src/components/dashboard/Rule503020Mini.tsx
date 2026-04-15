import { cn } from "@/lib/utils";
import { formatCurrency, DEFAULT_PREFERENCES } from "@/lib/utils/formatCurrency";
import type { RuleBlocks, UserPreferences } from "@/types";

interface Rule503020MiniProps {
  blocks: RuleBlocks;
  preferences?: UserPreferences | null;
}

const BLOCKS = [
  { key: "needs" as const, label: "Necesidades", ideal: 50, color: "bg-secondary", text: "text-secondary" },
  { key: "wants" as const, label: "Deseos",       ideal: 30, color: "bg-tertiary",  text: "text-tertiary" },
  { key: "savings" as const, label: "Ahorro",     ideal: 20, color: "bg-primary",   text: "text-primary" },
];

export function Rule503020Mini({ blocks, preferences }: Rule503020MiniProps) {
  const prefs = preferences ?? { ...DEFAULT_PREFERENCES, date_format: "DD/MM/YYYY" };

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-[0_2px_12px_rgba(25,28,30,0.06)] overflow-hidden">
      <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between">
        <div>
          <h2 className="font-headline font-bold text-slate-900">Regla 50/30/20</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Distribución del mes</p>
        </div>
      </div>
      <div className="px-6 py-5 flex flex-col gap-4">
        {BLOCKS.map(({ key, label, ideal, color, text }) => {
          const block = blocks[key];
          const clampedPct = Math.min(block.pct, 100);
          return (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface-variant">
                  {label} <span className="text-outline-variant">· {ideal}%</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-black font-headline", text)}>
                    {block.pct.toFixed(0)}%
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {formatCurrency(block.actual, prefs)}
                  </span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-outline-variant/15 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    block.status === "over" ? "bg-error" : color
                  )}
                  style={{ width: `${clampedPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
