"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoryMutations, type CategoryFormData, type CategoryType, type RuleBlock } from "@/hooks/useCategoryMutations";
import type { Category } from "@/types";

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editCategory?: Category | null;
  parentCategory?: Category | null;
  defaultType?: CategoryType;
  onSuccess?: () => void;
}

const RULE_BLOCK_OPTIONS: { value: RuleBlock; label: string }[] = [
  { value: "needs", label: "Necesidades" },
  { value: "wants", label: "Deseos" },
  { value: "savings", label: "Ahorro" },
];

export function CategoryModal({
  open,
  onOpenChange,
  editCategory,
  parentCategory,
  defaultType = "expense",
  onSuccess,
}: CategoryModalProps) {
  const isEdit = !!editCategory;
  const isSubcategory = !!parentCategory;

  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>(defaultType);
  const [ruleBlock, setRuleBlock] = useState<RuleBlock>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { createCategory, updateCategory } = useCategoryMutations(onSuccess);

  useEffect(() => {
    if (open) {
      if (editCategory) {
        setName(editCategory.name);
        setType(editCategory.type);
        setRuleBlock(editCategory.rule_block);
      } else {
        setName("");
        setType(parentCategory?.type ?? defaultType);
        setRuleBlock(parentCategory?.rule_block ?? null);
      }
      setError("");
    }
  }, [open, editCategory, parentCategory, defaultType]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("El nombre es obligatorio");
      return;
    }
    if (trimmedName.length > 50) {
      setError("El nombre no puede superar 50 caracteres");
      return;
    }

    setSaving(true);
    const data: CategoryFormData = {
      name: trimmedName,
      type,
      rule_block: isSubcategory ? parentCategory!.rule_block : ruleBlock,
      parent_id: parentCategory?.id ?? null,
    };

    let ok: boolean;
    if (isEdit) {
      ok = await updateCategory(editCategory.id, data);
    } else {
      ok = await createCategory(data);
    }

    setSaving(false);

    if (ok) {
      onOpenChange(false);
      onSuccess?.();
    } else {
      setError(isEdit ? "Error al actualizar la categoría" : "Error al crear la categoría");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar categoría" : isSubcategory ? "Añadir subcategoría" : "Nueva categoría"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos de la categoría"
              : isSubcategory
                ? `Nueva subcategoría bajo "${parentCategory.name}"`
                : "Crea una nueva categoría para tus movimientos"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Gimnasio"
              maxLength={50}
              autoFocus
            />
          </div>

          {!isEdit && !isSubcategory && (
            <>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={type} onValueChange={(v) => setType(v as CategoryType)}>
                  <SelectTrigger id="type" className="bg-surface-container-low border-none rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Gasto</SelectItem>
                    <SelectItem value="income">Ingreso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {type === "expense" && (
                <div className="space-y-2">
                  <Label htmlFor="ruleBlock">Bloque 50/30/20</Label>
                  <Select
                    value={ruleBlock ?? ""}
                    onValueChange={(v) => setRuleBlock((v === "" ? null : v) as RuleBlock)}
                  >
                    <SelectTrigger id="ruleBlock" className="bg-surface-container-low border-none rounded-xl">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin asignar</SelectItem>
                      {RULE_BLOCK_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          {isSubcategory && (
            <div className="bg-surface-container-low rounded-lg px-3 py-2 text-sm">
              <span className="text-on-surface-variant">Pertenece a: </span>
              <span className="font-medium text-on-surface">{parentCategory.name}</span>
            </div>
          )}

          {error && (
            <p className="text-sm text-error">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1 gradient-primary text-on-primary font-bold rounded-xl"
            >
              {saving ? "Guardando..." : isEdit ? "Guardar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}