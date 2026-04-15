import { RuleBar } from "./RuleBar";
import { RuleInsightBox } from "./RuleInsightBox";
import { ProjectionCard } from "./ProjectionCard";
import type { RuleBlocks, UserPreferences } from "@/types";

interface RuleSectionProps {
  blocks: RuleBlocks;
  insightText: string;
  preferences?: UserPreferences | null;
}

export function RuleSection({ blocks, insightText, preferences }: RuleSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Main grid: bars + projection */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Bars */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_2px_12px_rgba(25,28,30,0.06)] overflow-hidden">
          <div className="px-6 py-5 border-b border-outline-variant/10">
            <h3 className="font-headline font-bold text-slate-900">Distribución de gastos</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Comparativa real vs regla 50/30/20</p>
          </div>
          <div className="px-6 py-6 flex flex-col gap-8">
            <RuleBar
              label="Necesidades"
              idealPct={50}
              block={blocks.needs}
              color="needs"
              preferences={preferences}
            />
            <RuleBar
              label="Deseos"
              idealPct={30}
              block={blocks.wants}
              color="wants"
              preferences={preferences}
            />
            <RuleBar
              label="Ahorro"
              idealPct={20}
              block={blocks.savings}
              color="savings"
              preferences={preferences}
            />
          </div>
        </div>

        {/* Projection */}
        <ProjectionCard blocks={blocks} preferences={preferences} />
      </div>

      {/* Insight */}
      <RuleInsightBox text={insightText} />
    </div>
  );
}
