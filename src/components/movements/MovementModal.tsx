"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { auth, db } from "@/lib/firebase/client";
import { todayISO } from "@/lib/utils/formatDate";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

// ─── Schema ───────────────────────────────────────────────────────────────────

const movementSchema = z.object({
  concept: z.string().min(1, "El concepto es obligatorio"),
  category_id: z.string().min(1, "Selecciona una categoría"),
  subcategory_id: z.string().optional(),
  amount: z.string().min(1, "El importe es obligatorio").refine(
    (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
    "El importe debe ser mayor que 0"
  ),
  date: z.string().min(1, "La fecha es obligatoria"),
  is_recurring: z.boolean(),
  notes: z.string().optional(),
});

type MovementFormValues = z.infer<typeof movementSchema>;

interface MovementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: "income" | "expense";
  onSuccess?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MovementModal({
  open,
  onOpenChange,
  defaultType = "expense",
  onSuccess,
}: MovementModalProps) {
  const [type, setType] = useState<"income" | "expense">(defaultType);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUserId(u?.uid ?? null));
    return unsub;
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MovementFormValues>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      concept: "",
      category_id: "",
      subcategory_id: "",
      amount: "",
      date: todayISO(),
      is_recurring: false,
      notes: "",
    },
  });

  const selectedCategoryId = watch("category_id");

  // Cargar categorías al abrir o cambiar tipo
  useEffect(() => {
    if (!open || !userId) return;

    async function loadCategories() {
      const q = query(
        collection(db, "users", userId!, "categories"),
        where("type", "==", type),
        where("is_active", "==", true),
        where("parent_id", "==", null),
        orderBy("sort_order")
      );
      const snap = await getDocs(q);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setCategories(snap.docs.map((d) => ({ id: d.id, user_id: userId!, ...d.data() }) as any));
      setSubcategories([]);
    }

    loadCategories();
    reset({
      concept: "",
      category_id: "",
      subcategory_id: "",
      amount: "",
      date: todayISO(),
      is_recurring: false,
      notes: "",
    });
  }, [type, open, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cargar subcategorías (solo gastos)
  useEffect(() => {
    if (type !== "expense" || !selectedCategoryId || !userId) {
      setSubcategories([]);
      return;
    }

    async function loadSubcategories() {
      const q = query(
        collection(db, "users", userId!, "categories"),
        where("parent_id", "==", selectedCategoryId),
        where("is_active", "==", true),
        orderBy("sort_order")
      );
      const snap = await getDocs(q);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSubcategories(snap.docs.map((d) => ({ id: d.id, user_id: userId!, ...d.data() }) as any));
      setValue("subcategory_id", "");
    }

    loadSubcategories();
  }, [selectedCategoryId, type, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset al cerrar
  useEffect(() => {
    if (!open) {
      setType(defaultType);
      reset();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: MovementFormValues) {
    if (!userId) return;
    setLoading(true);

    const amount = parseFloat(values.amount);
    const collectionName = type === "income" ? "income_entries" : "expense_entries";

    try {
      await addDoc(collection(db, "users", userId, collectionName), {
        concept: values.concept,
        category_id: values.category_id,
        ...(type === "expense" && { subcategory_id: values.subcategory_id || null }),
        amount,
        date: values.date,
        is_recurring: values.is_recurring,
        notes: values.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      toast.success(type === "income" ? "Ingreso registrado correctamente" : "Gasto registrado correctamente");
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error(`Error al guardar el ${type === "income" ? "ingreso" : "gasto"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface-container-lowest border-none shadow-[0_20px_60px_rgba(25,28,30,0.12)] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline font-black text-xl text-slate-900">
            Nuevo Movimiento
          </DialogTitle>
        </DialogHeader>

        {/* Type toggle */}
        <div className="flex rounded-xl bg-surface-container-low p-1 gap-1">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={cn(
              "flex-1 py-2 text-sm font-semibold font-headline rounded-lg transition-all",
              type === "expense"
                ? "bg-surface-container-lowest text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <span className="material-symbols-outlined text-[16px] align-middle mr-1">receipt_long</span>
            Gasto
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={cn(
              "flex-1 py-2 text-sm font-semibold font-headline rounded-lg transition-all",
              type === "income"
                ? "bg-surface-container-lowest text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <span className="material-symbols-outlined text-[16px] align-middle mr-1">payments</span>
            Ingreso
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Concepto</Label>
            <Input
              {...register("concept")}
              placeholder={type === "income" ? "Ej: Nómina enero" : "Ej: Supermercado Mercadona"}
              className="bg-surface-container-low border-none rounded-xl focus-visible:ring-primary/20"
            />
            {errors.concept && <p className="text-xs text-error">{errors.concept.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Importe</Label>
              <Input
                {...register("amount")}
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                className="bg-surface-container-low border-none rounded-xl focus-visible:ring-primary/20"
              />
              {errors.amount && <p className="text-xs text-error">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</Label>
              <Input
                {...register("date")}
                type="date"
                className="bg-surface-container-low border-none rounded-xl focus-visible:ring-primary/20"
              />
              {errors.date && <p className="text-xs text-error">{errors.date.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoría</Label>
            <Select
              value={watch("category_id")}
              onValueChange={(v) => v && setValue("category_id", v, { shouldValidate: true })}
            >
              <SelectTrigger className="bg-surface-container-low border-none rounded-xl focus:ring-primary/20">
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && <p className="text-xs text-error">{errors.category_id.message}</p>}
          </div>

          {type === "expense" && subcategories.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Subcategoría <span className="normal-case font-normal">(opcional)</span>
              </Label>
              <Select
                value={watch("subcategory_id") ?? ""}
                onValueChange={(v) => v != null && setValue("subcategory_id", v)}
              >
                <SelectTrigger className="bg-surface-container-low border-none rounded-xl focus:ring-primary/20">
                  <SelectValue placeholder="Selecciona subcategoría" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Notas <span className="normal-case font-normal">(opcional)</span>
            </Label>
            <Input
              {...register("notes")}
              placeholder="Notas adicionales..."
              className="bg-surface-container-low border-none rounded-xl focus-visible:ring-primary/20"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              {...register("is_recurring")}
              type="checkbox"
              className="w-4 h-4 rounded accent-primary cursor-pointer"
            />
            <span className="text-sm text-slate-600">
              Es un {type === "income" ? "ingreso" : "gasto"} recurrente (mensual)
            </span>
          </label>

          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-on-primary font-bold font-headline rounded-xl py-3 hover:opacity-90 active:scale-95 transition-all"
          >
            {loading ? "Guardando..." : `Guardar ${type === "income" ? "Ingreso" : "Gasto"}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
