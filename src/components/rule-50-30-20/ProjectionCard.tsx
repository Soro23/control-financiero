import { formatCurrency, DEFAULT_PREFERENCES } from "@/lib/utils/formatCurrency";
import type { RuleBlocks, UserPreferences } from "@/types";

interface ProjectionCardProps {
  blocks: RuleBlocks;
  preferences?: UserPreferences | null;
}

export function ProjectionCard({ blocks, preferences }: ProjectionCardProps) {
  const prefs = preferences ?? { ...DEFAULT_PREFERENCES, date_format: "DD/MM/YYYY" };
  const { totalIngresos, needs, wants, savings } = blocks;

  const totalGastos = needs.actual + wants.actual;
  const ahorro = savings.actual;
  const ahorroAnual = ahorro * 12;

  return (
    <div className="gradient-primary rounded-2xl p-6 text-on-primary flex flex-col gap-5">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px] text-on-primary">timeline</span>
        </div>
        <div>
          <p className="text-xs font-semibold text-on-primary/70 uppercase tracking-wider">Proyección</p>
          <p className="font-bold font-headline">Este mes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/8 rounded-xl p-4">
          <p className="text-xs text-on-primary/70 mb-1">Ingresos</p>
          <p className="text-lg font-black font-headline">{formatCurrency(totalIngresos, prefs)}</p>
        </div>
        <div className="bg-white/8 rounded-xl p-4">
          <p className="text-xs text-on-primary/70 mb-1">Gastos totales</p>
          <p className="text-lg font-black font-headline">{formatCurrency(totalGastos, prefs)}</p>
        </div>
        <div className="bg-white/8 rounded-xl p-4">
          <p className="text-xs text-on-primary/70 mb-1">Ahorro mensual</p>
          <p className="text-lg font-black font-headline text-secondary-container">
            {formatCurrency(ahorro, prefs)}
          </p>
        </div>
        <div className="bg-white/8 rounded-xl p-4">
          <p className="text-xs text-on-primary/70 mb-1">Proyección anual</p>
          <p className="text-lg font-black font-headline text-secondary-container">
            {formatCurrency(ahorroAnual, prefs)}
          </p>
        </div>
      </div>
    </div>
  );
}
