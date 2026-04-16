"use client";

import { useState, useCallback, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { parseBBVAExcel, type ParsedMovement, generateMovementHash } from "@/lib/import/parseBBVA";
import { collection, query, getDocs, addDoc } from "firebase/firestore";
import { toast } from "sonner";
import { formatCurrency, DEFAULT_PREFERENCES } from "@/lib/utils/formatCurrency";

interface CategoryInfo {
  id: string;
  name: string;
}

interface MovementWithCategory extends ParsedMovement {
  categoryId: string;
}

export default function ImportarPage() {
  const [movements, setMovements] = useState<MovementWithCategory[]>([]);
  const [importing, setImporting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [targetMonth, setTargetMonth] = useState<number>(new Date().getMonth() + 1);
  const [targetYear, setTargetYear] = useState<number>(new Date().getFullYear());
  const [importType, setImportType] = useState<"expense" | "income">("expense");
  const [categories, setCategories] = useState<CategoryInfo[]>([]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const parsed = parseBBVAExcel(arrayBuffer);
      
      const withCategories: MovementWithCategory[] = parsed.map((m) => ({
        ...m,
        categoryId: "",
      }));
      setMovements(withCategories);
      toast.success(`${parsed.length} movimientos detectados`);
    } catch (error) {
      console.error("Error parsing file:", error);
      toast.error("Error al parsear el archivo");
    }
  }, []);

  const loadCategoriesForType = useCallback(async (uid: string, type: "expense" | "income") => {
    // Use single categories collection, filter by type field
    const q = query(collection(db, "users", uid, "categories"));
    const snapshot = await getDocs(q);
    const cats: CategoryInfo[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Filter by type field (expense/income)
      if (data.type === type) {
        cats.push({ id: doc.id, name: doc.data().name });
      }
    });
    return cats;
  }, []);

  // Set up user auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
    });
    return unsubscribe;
  }, []);

  // Load categories when userId or importType changes
  useEffect(() => {
    if (!userId) return;
    loadCategoriesForType(userId, importType).then((cats) => {
      setCategories(cats);
    });
  }, [userId, importType]);

  // Map movements to categories when both are available
  useEffect(() => {
    if (movements.length > 0 && categories.length > 0) {
      setMovements((prev) =>
        prev.map((m) => {
          if (m.categoryId) return m;
          // Try to find matching category by name (fuzzy match)
          const suggestedCat = categories.find(
            (c) => c.name.toLowerCase() === m.categoriaSugerida.toLowerCase() ||
                   m.categoriaSugerida.toLowerCase().includes(c.name.toLowerCase()) ||
                   c.name.toLowerCase().includes(m.categoriaSugerida.toLowerCase())
          );
          return { ...m, categoryId: suggestedCat?.id || "" };
        })
      );
    }
  }, [categories, movements.length]);

  const updateMovementCategory = (index: number, categoryId: string) => {
    setMovements((prev) =>
      prev.map((m, i) => (i === index ? { ...m, categoryId } : m))
    );
  };

  const getCategoryId = (categoryName: string): string => {
    const cat = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
    return cat?.id || "";
  };

  const handleImport = async () => {
    if (!userId || movements.length === 0) return;

    setImporting(true);
    const col = importType === "expense" ? "expense_entries" : "income_entries";
    let imported = 0;
    let skipped = 0;

    const existingHashes = new Set<string>();
    const existingQ = query(collection(db, "users", userId, col));
    const existingSnap = await getDocs(existingQ);
    existingSnap.forEach((d) => {
      const data = d.data();
      const hash = generateMovementHash(data.date, data.amount, data.concept);
      existingHashes.add(hash);
    });

    for (const m of movements) {
      const hash = generateMovementHash(m.fecha, m.importe, m.concepto);
      
      if (existingHashes.has(hash)) {
        skipped++;
        continue;
      }

      const fechaParts = m.fecha.split("/");
      let fechaISO: string;
      if (fechaParts.length === 3) {
        fechaISO = `${fechaParts[2]}-${fechaParts[1]}-${fechaParts[0]}`;
      } else {
        fechaISO = new Date().toISOString().split("T")[0];
      }

      const categoryId = m.categoryId || getCategoryId(m.categoriaSugerida);

      try {
        await addDoc(collection(db, "users", userId, col), {
          user_id: userId,
          category_id: categoryId || (importType === "expense" ? "otros" : "ingresos_ocasionales"),
          subcategory_id: null,
          concept: m.concepto,
          amount: Math.abs(m.importe),
          date: fechaISO,
          is_recurring: false,
          notes: m.observaciones || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        imported++;
      } catch (err) {
        console.error("Error importing:", err);
      }
    }

    setImporting(false);
    if (imported > 0) {
      toast.success(`Importados ${imported} movimientos`);
      setMovements([]);
    }
    if (skipped > 0) {
      toast.info(`${skipped} movimientos omitidos (ya existen)`);
    }
  };

  const incomeCount = movements.filter(m => m.importe > 0).length;
  const expenseCount = movements.filter(m => m.importe < 0).length;
  const totalIncome = movements.filter(m => m.importe > 0).reduce((sum, m) => sum + m.importe, 0);
  const totalExpense = movements.filter(m => m.importe < 0).reduce((sum, m) => sum + Math.abs(m.importe), 0);

  return (
    <div className="py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-headline text-slate-900 tracking-tight">
          Importar movimientos
        </h1>
        <p className="text-sm text-on-surface-variant mt-0.5">
          Importa movimientos desde tu banco (BBVA)
        </p>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-6">
        <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">upload_file</span>
          <p className="mt-2 text-sm text-on-surface-variant">
            Sube el archivo Excel de tu banco (BBVA)
          </p>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="mt-4 mx-auto block text-sm"
          />
        </div>

        {movements.length > 0 && (
          <>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setImportType("expense")}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    importType === "expense"
                      ? "bg-error text-white"
                      : "bg-surface-container text-on-surface"
                  }`}
                >
                  Gastos ({expenseCount})
                </button>
                <button
                  onClick={() => setImportType("income")}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    importType === "income"
                      ? "bg-success text-white"
                      : "bg-surface-container text-on-surface"
                  }`}
                >
                  Ingresos ({incomeCount})
                </button>
              </div>

              <div className="flex gap-2 items-center">
                <label className="text-sm text-on-surface-variant">Mes:</label>
                <select
                  value={targetMonth}
                  onChange={(e) => setTargetMonth(Number(e.target.value))}
                  className="bg-surface-container px-3 py-2 rounded-lg text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString("es", { month: "long" })}
                    </option>
                  ))}
                </select>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(Number(e.target.value))}
                  className="bg-surface-container px-3 py-2 rounded-lg text-sm"
                >
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface-container rounded-xl p-4">
                <p className="text-xs font-semibold text-on-surface-variant uppercase">Movimientos</p>
                <p className="text-2xl font-black font-headline">{movements.length}</p>
              </div>
              <div className="bg-surface-container rounded-xl p-4">
                <p className="text-xs font-semibold text-on-surface-variant uppercase">Ingresos</p>
                <p className="text-2xl font-black font-headline text-success">
                  {formatCurrency(totalIncome, DEFAULT_PREFERENCES)}
                </p>
              </div>
              <div className="bg-surface-container rounded-xl p-4">
                <p className="text-xs font-semibold text-on-surface-variant uppercase">Gastos</p>
                <p className="text-2xl font-black font-headline text-error">
                  {formatCurrency(totalExpense, DEFAULT_PREFERENCES)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Vista previa</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {movements.slice(0, 20).map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-surface-container rounded-lg text-sm"
                  >
                    <span className={`font-bold w-16 ${m.importe > 0 ? "text-success" : "text-error"}`}>
                      {m.importe > 0 ? "+" : ""}{formatCurrency(m.importe, DEFAULT_PREFERENCES)}
                    </span>
                    <span className="w-20 text-on-surface-variant">{m.fecha}</span>
                    <span className="flex-1 truncate">{m.concepto}</span>
                    <select
                      value={m.categoryId || getCategoryId(m.categoriaSugerida)}
                      onChange={(e) => updateMovementCategory(i, e.target.value)}
                      className="text-xs bg-surface-container-lowest px-2 py-1 rounded border border-outline-variant/20"
                    >
                      <option value="">Sin categoría</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                {movements.length > 20 && (
                  <p className="text-sm text-on-surface-variant text-center py-2">
                    ... y {movements.length - 20} más
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full gradient-primary text-on-primary py-4 rounded-xl font-bold font-headline text-base hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
            >
              {importing ? "Importando..." : `Importar ${importType === "expense" ? expenseCount : incomeCount} movimientos`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
