"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, DEFAULT_PREFERENCES } from "@/lib/utils/formatCurrency";
import type { SavingGoal, UserPreferences } from "@/types";

interface GoalContributionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: SavingGoal;
  preferences?: UserPreferences | null;
  onConfirm: (amount: number) => Promise<boolean>;
}

export function GoalContributionModal({
  open,
  onOpenChange,
  goal,
  preferences,
  onConfirm,
}: GoalContributionModalProps) {
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const prefs = preferences ?? { ...DEFAULT_PREFERENCES, date_format: "DD/MM/YYYY" };

  const remaining = Math.max(0, goal.target_amount - goal.accumulated);
  const suggested = goal.monthly_contribution ?? null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) return;

    setSaving(true);
    const ok = await onConfirm(value);
    setSaving(false);

    if (ok) {
      toast.success(`Aportación de ${formatCurrency(value, prefs)} registrada`);
      setAmount("");
    } else {
      toast.error("Error al registrar la aportación");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-surface-container-lowest rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-outline-variant/10">
          <DialogTitle className="font-headline font-black text-slate-900 text-lg">
            Añadir aportación
          </DialogTitle>
          <p className="text-sm text-on-surface-variant">{goal.name}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Info */}
          <div className="flex gap-3">
            <div className="flex-1 bg-surface-container-low rounded-xl px-4 py-3">
              <p className="text-xs text-on-surface-variant">Acumulado</p>
              <p className="text-base font-black font-headline text-secondary mt-0.5">
                {formatCurrency(goal.accumulated, prefs)}
              </p>
            </div>
            <div className="flex-1 bg-surface-container-low rounded-xl px-4 py-3">
              <p className="text-xs text-on-surface-variant">Restante</p>
              <p className="text-base font-black font-headline text-slate-900 mt-0.5">
                {formatCurrency(remaining, prefs)}
              </p>
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Importe de la aportación
            </Label>
            <div className="relative">
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                autoFocus
                className="bg-surface-container-low border-none rounded-xl focus-visible:ring-primary/20 pr-8 text-lg font-headline font-black"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">€</span>
            </div>
          </div>

          {/* Suggested amounts */}
          {(suggested !== null || remaining > 0) && (
            <div className="flex gap-2 flex-wrap">
              {suggested !== null && suggested > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(String(suggested))}
                  className="text-xs px-3 py-1.5 rounded-full bg-primary/8 text-primary font-semibold hover:bg-primary/15 transition-colors"
                >
                  {formatCurrency(suggested, prefs)} (mensual habitual)
                </button>
              )}
              {remaining > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(String(remaining))}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary/8 text-secondary font-semibold hover:bg-secondary/15 transition-colors"
                >
                  {formatCurrency(remaining, prefs)} (restante completo)
                </button>
              )}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold font-headline text-slate-600 bg-surface-container-low hover:bg-surface-container transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !amount || parseFloat(amount) <= 0}
              className="flex-1 gradient-primary text-on-primary py-3 rounded-xl font-bold font-headline text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando..." : "Registrar"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
