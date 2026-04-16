"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { SavingGoal, SavingGoalFormData } from "@/types";

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: SavingGoal | null;
  onSubmit: (data: SavingGoalFormData) => Promise<boolean>;
}

const ICONS = [
  "savings", "home", "directions_car", "flight", "school",
  "favorite", "shopping_bag", "devices", "health_and_safety", "beach_access",
];

const COLORS: SavingGoalFormData["color"][] = ["primary", "secondary", "tertiary", "error"];

const COLOR_STYLES: Record<SavingGoalFormData["color"], string> = {
  primary:   "bg-primary",
  secondary: "bg-secondary",
  tertiary:  "bg-tertiary",
  error:     "bg-error",
};

const COLOR_LABELS: Record<SavingGoalFormData["color"], string> = {
  primary:   "Azul marino",
  secondary: "Verde",
  tertiary:  "Morado",
  error:     "Rojo",
};

export function GoalForm({ open, onOpenChange, goal, onSubmit }: GoalFormProps) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [icon, setIcon] = useState(goal?.icon ?? "savings");
  const [color, setColor] = useState<SavingGoalFormData["color"]>(goal?.color ?? "secondary");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(String(goal.target_amount));
      setDeadline(goal.deadline ?? "");
      setMonthlyContribution(goal.monthly_contribution ? String(goal.monthly_contribution) : "");
      setIcon(goal.icon);
      setColor(goal.color);
    } else {
      setName("");
      setTargetAmount("");
      setDeadline("");
      setMonthlyContribution("");
      setIcon("savings");
      setColor("secondary");
    }
  }, [goal, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    if (!name || isNaN(target) || target <= 0) return;

    setSaving(true);
    const ok = await onSubmit({
      name,
      target_amount: target,
      deadline: deadline || undefined,
      monthly_contribution: monthlyContribution ? parseFloat(monthlyContribution) : undefined,
      icon,
      color,
    });
    setSaving(false);
    if (ok) onOpenChange(false);
  }

  const isEditing = !!goal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-surface-container-lowest rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-outline-variant/10">
          <DialogTitle className="font-headline font-black text-slate-900 text-lg">
            {isEditing ? "Editar objetivo" : "Nuevo objetivo de ahorro"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Nombre del objetivo</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Fondo de emergencia"
              autoFocus
              className="bg-surface-container-low border-none rounded-xl focus-visible:ring-primary/20"
            />
          </div>

          {/* Target amount */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Meta de ahorro (€)</Label>
            <Input
              type="number"
              min="1"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0,00"
              className="bg-surface-container-low border-none rounded-xl focus-visible:ring-primary/20"
            />
          </div>

          {/* Monthly contribution */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Aportación mensual objetivo (€) <span className="text-outline-variant normal-case font-normal ml-1">opcional</span>
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              placeholder="0,00"
              className="bg-surface-container-low border-none rounded-xl focus-visible:ring-primary/20"
            />
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Fecha límite <span className="text-outline-variant normal-case font-normal ml-1">opcional</span>
            </Label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="bg-surface-container-low border-none rounded-xl focus-visible:ring-primary/20"
            />
          </div>

          {/* Icon selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Icono</Label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    icon === ic
                      ? "gradient-primary text-on-primary shadow-md"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  )}
                >
                  <span className="material-symbols-outlined text-[20px]">{ic}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Color</Label>
            <div className="flex gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  title={COLOR_LABELS[c]}
                  className={cn(
                    "w-9 h-9 rounded-full transition-all",
                    COLOR_STYLES[c],
                    color === c && "ring-2 ring-offset-2 ring-slate-900"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold font-headline text-slate-600 bg-surface-container-low hover:bg-surface-container transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !name || !targetAmount}
              className="flex-1 gradient-primary text-on-primary py-3 rounded-xl font-bold font-headline text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear objetivo"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
