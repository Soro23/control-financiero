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
  updateDoc,
  doc,
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
import { createForwardRecurringEntries } from "@/lib/firebase/recurring";
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
  recurrence_frequency: z.enum(["weekly", "biweekly", "monthly", "bimonthly", "quarterly", "yearly"]).optional(),
  notes: z.string().optional(),
});

type MovementFormValues = z.infer<typeof movementSchema>;
type RecurrenceFrequency = MovementFormValues["recurrence_frequency"];

interface MovementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: "income" | "expense";
  onSuccess?: () => void;
  defaultEntry?: {
    id: string;
    concept: string;
    category_id: string;
    subcategory_id?: string;
    amount: number;
    date: string;
    is_recurring: boolean;
    recurrence_frequency?: "weekly" | "biweekly" | "monthly" | "bimonthly" | "quarterly" | "yearly";
    notes?: string | null;
    type: "income" | "expense";
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MovementModal({
  open,
  onOpenChange,
  defaultType = "expense",
  onSuccess,
  defaultEntry,
}: MovementModalProps) {
  const [type, setType] = useState<"income" | "expense">(defaultEntry?.type ?? defaultType);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const isEditing = !!defaultEntry;

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
      recurrence_frequency: undefined,
      notes: "",
    },
  });

  const selectedCategoryId = watch("category_id");
  const isRecurring = watch("is_recurring");

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

    // Precargar datos si es edición
    if (defaultEntry) {
      const typeUnchanged = type === defaultEntry.type;
      reset({
        concept: defaultEntry.concept,
        category_id: typeUnchanged ? defaultEntry.category_id : "",
        subcategory_id: typeUnchanged ? (defaultEntry.subcategory_id || "") : "",
        amount: defaultEntry.amount.toString(),
        date: defaultEntry.date,
        is_recurring: defaultEntry.is_recurring,
        recurrence_frequency: defaultEntry.recurrence_frequency,
        notes: defaultEntry.notes || "",
      });
    } else {
      reset({
        concept: "",
        category_id: "",
        subcategory_id: "",
        amount: "",
        date: todayISO(),
        is_recurring: false,
        recurrence_frequency: undefined,
        notes: "",
      });
    }
  }, [type, open, userId, defaultEntry]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const baseData = {
      concept: values.concept,
      category_id: values.category_id,
      ...(type === "expense" && { subcategory_id: values.subcategory_id || null }),
      amount,
      is_recurring: values.is_recurring,
      recurrence_frequency: values.is_recurring ? values.recurrence_frequency : null,
      notes: values.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      if (isEditing && defaultEntry) {
        await updateDoc(doc(db, "users", userId, collectionName, defaultEntry.id), {
          ...baseData,
          updated_at: new Date().toISOString(),
        });
        toast.success(type === "income" ? "Ingreso actualizado correctamente" : "Gasto actualizado correctamente");
      } else {
        await addDoc(collection(db, "users", userId, collectionName), {
          ...baseData,
          date: values.date,
        });
        
        // Pre-generate all past occurrences from startDate → today.
        // Future months and any gaps are covered by backfillRecurringEntries
        // which runs automatically on each page load.
        if (values.is_recurring && values.recurrence_frequency) {
          await createForwardRecurringEntries(
            { ...baseData, date: values.date },
            values.date,
            values.recurrence_frequency,
            userId,
            collectionName as "income_entries" | "expense_entries"
          );
        }
        
        toast.success(type === "income" ? "Ingreso registrado correctamente" : "Gasto registrado correctamente");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error(`Error al ${isEditing ? "actualizar" : "guardar"} el ${type === "income" ? "ingreso" : "gasto"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface-container-lowest border-none shadow-[0_20px_60px_rgba(25,28,30,0.12)] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline font-black text-xl text-slate-900">
            {isEditing ? "Editar Movimiento" : "Nuevo Movimiento"}
          </DialogTitle>
        </DialogHeader>

        {/* Type toggle */}
        <div className="flex rounded-xl bg-surface-container-low p-1 gap-1">
          <button
            type="button"
            onClick={() => { setValue("category_id", ""); setValue("subcategory_id", ""); setType("expense"); }}
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
            onClick={() => { setValue("category_id", ""); setValue("subcategory_id", ""); setType("income"); }}
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
              key={type}
              value={watch("category_id") || undefined}
              onValueChange={(v) => v && setValue("category_id", v, { shouldValidate: true })}
            >
              <SelectTrigger className="bg-surface-container-low border-none rounded-xl focus:ring-primary/20">
                <SelectValue placeholder="Selecciona categoría">
                  {categories.find((c) => c.id === watch("category_id"))?.name || "Selecciona categoría"}
                </SelectValue>
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
                  <SelectValue placeholder="Selecciona subcategoría">
                    {subcategories.find((s) => s.id === watch("subcategory_id"))?.name || "Selecciona subcategoría"}
                  </SelectValue>
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

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                {...register("is_recurring")}
                type="checkbox"
                className="w-4 h-4 rounded accent-primary cursor-pointer"
              />
              <span className="text-sm text-slate-600">
                Es un {type === "income" ? "ingreso" : "gasto"} recurrente
              </span>
            </label>

            {isRecurring && (
              <div className="pl-7">
                <Select
                  value={watch("recurrence_frequency") || ""}
                  onValueChange={(v) => v && setValue("recurrence_frequency", v as RecurrenceFrequency)}
                >
                  <SelectTrigger className="bg-surface-container-low border-none rounded-xl focus:ring-primary/20 text-sm">
                    <SelectValue placeholder="Selecciona frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="biweekly">Quincenal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="bimonthly">Bimensual (2 meses)</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-on-primary font-bold font-headline rounded-xl py-3 hover:opacity-90 active:scale-95 transition-all"
          >
            {loading ? "Guardando..." : isEditing ? "Actualizar" : `Guardar ${type === "income" ? "Ingreso" : "Gasto"}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
