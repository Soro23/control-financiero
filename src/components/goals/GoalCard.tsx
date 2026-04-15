import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { GoalContributionModal } from "./GoalContributionModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatCurrency, DEFAULT_PREFERENCES } from "@/lib/utils/formatCurrency";
import { calcularGoal } from "@/lib/calculations/objetivos";
import type { SavingGoal, UserPreferences } from "@/types";

interface GoalCardProps {
  goal: SavingGoal;
  preferences?: UserPreferences | null;
  onEdit: (goal: SavingGoal) => void;
  onDelete: (id: string) => void;
  onContribute: (id: string, amount: number) => Promise<boolean>;
}

const COLOR_MAP = {
  primary:   { bg: "bg-primary/8",   icon: "text-primary",   bar: "navy"  as const },
  secondary: { bg: "bg-secondary/8", icon: "text-secondary", bar: "green" as const },
  tertiary:  { bg: "bg-tertiary/8",  icon: "text-tertiary",  bar: "green" as const },
  error:     { bg: "bg-error/8",     icon: "text-error",     bar: "red"   as const },
};

export function GoalCard({ goal, preferences, onEdit, onDelete, onContribute }: GoalCardProps) {
  const [contributionOpen, setContributionOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const prefs = preferences ?? { ...DEFAULT_PREFERENCES, date_format: "DD/MM/YYYY" };
  const calc = calcularGoal(goal);
  const c = COLOR_MAP[goal.color];

  const isCompleted = goal.accumulated >= goal.target_amount;

  return (
    <>
      <div className="bg-surface-container-lowest rounded-2xl shadow-[0_2px_12px_rgba(25,28,30,0.06)] p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", c.bg)}>
              <span className={cn("material-symbols-outlined text-[22px]", c.icon)}>
                {goal.icon}
              </span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-slate-900">{goal.name}</h3>
              {isCompleted && (
                <span className="text-xs font-bold text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] fill-icon">check_circle</span>
                  ¡Meta alcanzada!
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(goal)}
              className="w-8 h-8 rounded-lg hover:bg-surface-container-low flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">edit</span>
            </button>
            <button
              onClick={() => setConfirmDeleteOpen(true)}
              className="w-8 h-8 rounded-lg hover:bg-error/8 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant hover:text-error">delete</span>
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-2">
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black font-headline text-slate-900">
              {formatCurrency(goal.accumulated, prefs)}
            </span>
            <span className="text-sm text-on-surface-variant">
              de {formatCurrency(goal.target_amount, prefs)}
            </span>
          </div>
          <ProgressBar value={calc.progress} color={c.bar} />
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">
              {calc.progress.toFixed(0)}% completado
            </span>
            <span className="text-xs font-medium text-slate-700">
              Faltan {formatCurrency(calc.remaining, prefs)}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {calc.monthsLeft !== null && (
            <div className="bg-surface-container-low rounded-xl px-4 py-3">
              <p className="text-xs text-on-surface-variant">Meses estimados</p>
              <p className="text-base font-black font-headline text-slate-900 mt-0.5">
                {calc.monthsLeft}
              </p>
            </div>
          )}
          {(calc.requiredMonthly ?? goal.monthly_contribution) && (
            <div className="bg-surface-container-low rounded-xl px-4 py-3">
              <p className="text-xs text-on-surface-variant">Aportación/mes</p>
              <p className="text-base font-black font-headline text-slate-900 mt-0.5">
                {formatCurrency(calc.requiredMonthly ?? goal.monthly_contribution ?? 0, prefs)}
              </p>
            </div>
          )}
          {goal.deadline && (
            <div className="bg-surface-container-low rounded-xl px-4 py-3 col-span-2">
              <p className="text-xs text-on-surface-variant">Fecha límite</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">
                {new Date(goal.deadline).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        {!isCompleted && (
          <button
            onClick={() => setContributionOpen(true)}
            className="w-full gradient-primary text-on-primary py-3 rounded-xl font-bold font-headline text-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Añadir aportación
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Eliminar objetivo"
        description={`¿Seguro que quieres eliminar "${goal.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={() => { setConfirmDeleteOpen(false); onDelete(goal.id); }}
        onCancel={() => setConfirmDeleteOpen(false)}
      />

      <GoalContributionModal
        open={contributionOpen}
        onOpenChange={setContributionOpen}
        goal={goal}
        preferences={preferences}
        onConfirm={async (amount) => {
          const ok = await onContribute(goal.id, amount);
          if (ok) setContributionOpen(false);
          return ok;
        }}
      />
    </>
  );
}
