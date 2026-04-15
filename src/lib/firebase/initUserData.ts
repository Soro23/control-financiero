import {
  doc,
  setDoc,
  getDoc,
  collection,
  writeBatch,
} from "firebase/firestore";
import { db } from "./client";

// Categorías predefinidas (misma estructura que el seed SQL)
const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salario / Nómina",          sortOrder: 1 },
  { name: "Freelance / Autónomo",      sortOrder: 2 },
  { name: "Alquileres",                sortOrder: 3 },
  { name: "Dividendos / Inversiones",  sortOrder: 4 },
  { name: "Pensiones",                 sortOrder: 5 },
  { name: "Ventas",                    sortOrder: 6 },
  { name: "Bonificaciones",            sortOrder: 7 },
  { name: "Regalos / Herencias",       sortOrder: 8 },
  { name: "Ingresos Ocasionales",      sortOrder: 9 },
];

const DEFAULT_EXPENSE_CATEGORIES: {
  name: string;
  ruleBlock: "needs" | "wants";
  sortOrder: number;
  subcategories: string[];
}[] = [
  {
    name: "Vivienda & Servicios", ruleBlock: "needs", sortOrder: 1,
    subcategories: ["Alquiler", "Hipoteca", "Agua / Luz / Gas", "Internet", "Mantenimiento"],
  },
  {
    name: "Alimentación", ruleBlock: "needs", sortOrder: 2,
    subcategories: ["Supermercado", "Mercado", "Restaurantes", "Delivery"],
  },
  {
    name: "Transporte", ruleBlock: "needs", sortOrder: 3,
    subcategories: ["Gasolina", "Transporte Público", "ITV / Mantenimiento", "Parking"],
  },
  {
    name: "Salud & Seguros", ruleBlock: "needs", sortOrder: 4,
    subcategories: ["Médico", "Farmacia", "Seguro Médico", "Dentista", "Gimnasio"],
  },
  {
    name: "Entretenimiento", ruleBlock: "wants", sortOrder: 5,
    subcategories: ["Cine / Teatro", "Streaming", "Videojuegos", "Salidas / Ocio"],
  },
  {
    name: "Educación", ruleBlock: "wants", sortOrder: 6,
    subcategories: ["Formación", "Libros", "Idiomas"],
  },
  {
    name: "Ropa & Personal", ruleBlock: "wants", sortOrder: 7,
    subcategories: ["Ropa / Calzado", "Peluquería", "Higiene"],
  },
  {
    name: "Tecnología", ruleBlock: "wants", sortOrder: 8,
    subcategories: ["Software", "Hardware", "Servicios Cloud"],
  },
  {
    name: "Otros", ruleBlock: "wants", sortOrder: 9,
    subcategories: ["Regalos", "Impuestos", "Imprevistos"],
  },
];

/**
 * Inicializa las preferencias y categorías del usuario recién creado.
 * Idempotente: si ya existen, no hace nada.
 */
export async function initUserData(userId: string, displayName?: string | null) {
  // Verificar si ya están inicializados
  const prefsRef = doc(db, "users", userId, "preferences", "main");
  const prefsSnap = await getDoc(prefsRef);
  if (prefsSnap.exists()) return;

  const batch = writeBatch(db);

  // Preferencias por defecto
  batch.set(prefsRef, {
    name: displayName ?? null,
    currency: "EUR",
    currency_symbol: "€",
    symbol_position: "after",
    decimal_format: "comma",
    date_format: "DD/MM/YYYY",
    theme: "light",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // Categorías de ingresos
  for (const cat of DEFAULT_INCOME_CATEGORIES) {
    const catRef = doc(collection(db, "users", userId, "categories"));
    batch.set(catRef, {
      type: "income",
      name: cat.name,
      parent_id: null,
      rule_block: null,
      is_default: true,
      is_active: true,
      sort_order: cat.sortOrder,
      created_at: new Date().toISOString(),
    });
  }

  // Categorías de gastos con subcategorías
  for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
    const catRef = doc(collection(db, "users", userId, "categories"));
    batch.set(catRef, {
      type: "expense",
      name: cat.name,
      parent_id: null,
      rule_block: cat.ruleBlock,
      is_default: true,
      is_active: true,
      sort_order: cat.sortOrder,
      created_at: new Date().toISOString(),
    });

    // Subcategorías necesitan el ID del padre — hacemos un segundo batch
    // Los subcats se añaden después del commit inicial
  }

  await batch.commit();

  // Segunda pasada: subcategorías (necesitan IDs de padres ya guardados)
  const { getDocs, query, where, orderBy } = await import("firebase/firestore");
  const catsQuery = query(
    collection(db, "users", userId, "categories"),
    where("type", "==", "expense"),
    where("parent_id", "==", null),
    orderBy("sort_order")
  );
  const catsSnap = await getDocs(catsQuery);

  const subBatch = writeBatch(db);
  let subSortOrder = 1;

  for (const catDoc of catsSnap.docs) {
    const catName = catDoc.data().name;
    const catDef = DEFAULT_EXPENSE_CATEGORIES.find((c) => c.name === catName);
    if (!catDef) continue;

    for (const subName of catDef.subcategories) {
      const subRef = doc(collection(db, "users", userId, "categories"));
      subBatch.set(subRef, {
        type: "expense",
        name: subName,
        parent_id: catDoc.id,
        rule_block: catDef.ruleBlock,
        is_default: true,
        is_active: true,
        sort_order: subSortOrder++,
        created_at: new Date().toISOString(),
      });
    }
  }

  await subBatch.commit();
}
