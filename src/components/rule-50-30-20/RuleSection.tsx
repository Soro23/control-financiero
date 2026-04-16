import { RuleBar } from "./RuleBar";
import { RuleInsightBox } from "./RuleInsightBox";
import { ProjectionCard } from "./ProjectionCard";
import type { RuleBlocks, UserPreferences, EmergencyFund } from "@/types";
import { formatCurrency, DEFAULT_PREFERENCES } from "@/lib/utils/formatCurrency";

interface RuleSectionProps {
  blocks: RuleBlocks;
  insightText: string;
  preferences?: UserPreferences | null;
}

function EmergencyFundBar({ ef, preferences }: { ef?: EmergencyFund; preferences?: UserPreferences | null }) {
  const prefs = preferences ?? { ...DEFAULT_PREFERENCES, date_format: "DD/MM/YYYY" };
  if (!ef) return null;

  const monthsCovered = ef.target > 0 ? (ef.saved / (ef.target / 6)) : 0;
  const status = ef.progress >= 100 ? "completed" : ef.progress >= 50 ? "half" : "building";

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-5 border border-primary/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">shield</span>
          <span className="font-semibold text-slate-800">Fondo de Emergencia</span>
        </div>
        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-lg">
          {ef.progress >= 100 ? "✓ Completo" : `${Math.round(ef.progress)}%`}
        </span>
      </div>
      
      <div className="relative h-4 bg-primary/20 rounded-full overflow-hidden mb-3">
        <div
          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-700"
          style={{ width: `${Math.min(ef.progress, 100)}%` }}
        />
        <div className="absolute top-0 h-full w-0.5 bg-white/60 left-1/2" title="50% (3 meses)" />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-on-surface-variant">Ahorrado: </span>
          <span className="font-semibold text-slate-800">{formatCurrency(ef.saved, prefs)}</span>
        </div>
        <div className="text-right">
          <span className="text-on-surface-variant">Meta (6 meses): </span>
          <span className="font-semibold text-slate-800">{formatCurrency(ef.target, prefs)}</span>
        </div>
      </div>

      <p className="text-xs text-on-surface-variant mt-2">
        {status === "completed" 
          ? "✓ ¡Fondo de emergencia completo! Prioriza inversiones a largo plazo."
          : `Cubre ~${monthsCovered.toFixed(1)} meses de gastos. Meta: 3-6 meses.`}
      </p>
    </div>
  );
}

export function RuleSection({ blocks, insightText, preferences }: RuleSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Emergency Fund - Priority display */}
      <EmergencyFundBar ef={blocks.emergencyFund} preferences={preferences} />

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
              label="Ahorro e Inversión"
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
