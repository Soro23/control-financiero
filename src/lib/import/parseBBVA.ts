import * as XLSX from "xlsx";

export interface ParsedMovement {
  fecha: string;
  concepto: string;
  tipo: string;
  importe: number;
  observaciones: string;
  categoriaSugerida: string;
  subcategoriaSugerida: string;
}

interface CategoryKeywordMap {
  [categoryName: string]: string[];
}

const INCOME_KEYWORDS: CategoryKeywordMap = {
  "Salario / Nómina": ["nómina", "nomina", "salario", "preico juridicos", "pago empresa", "nómina"],
  "Freelance / Autónomo": ["freelance", "autónomo", "factura", "invoice"],
  "Alquileres": ["alquiler", "renta"],
  "Dividendos / Inversiones": ["dividendo", "rendimiento", "interés", "interes"],
  "Pensiones": ["pensión", "pension"],
  "Ventas": ["venta", "venta"],
  "Bonificaciones": ["bonificacion", "cashback", "devolución", "devolucion"],
  "Regalos / Herencias": ["regalo", "herencia", "donacion"],
  "Ingresos Ocasionales": [],
  "Transferencias": ["transferencia recibida", "recibido", "bizum recibido"],
};

const EXPENSE_KEYWORDS: CategoryKeywordMap = {
  "Vivienda & Servicios": [
    "agua", "luz", "gas", "electricidad", "internet", "telefónica", "vodafone", 
    "movistar", "orange", "orange", "mantenimiento", "hipoteca", "alquiler"
  ],
  "Alimentación": [
    "mercadona", "condis", "bonpreu", "carrefour", "lidl", "aldi", "dia", 
    "supermercado", "supermercat", "bonpan", "el bazar", "la teva botiga",
    "xiaoping he", "alimentacion", "alimentation", "mercado", "tradis"
  ],
  "Transporte": [
    "gasolina", "esclatoil", "benzinera", "combustible", "parking", 
    "itv", "mantenimiento coche", "metro", "bus", "tren"
  ],
  "Salud & Seguros": [
    "gimnasio", "fitness", "anytime", "farmacia", "médico", "medico", 
    "seguro", "dentista", "clinica", "hospital"
  ],
  "Entretenimiento": [
    "netflix", "spotify", "hbo", "disney", "videojuegos", "glovo", 
    "deliveroo", "cine", "teatro", "concierto", "amazon prime"
  ],
  "Educación": [
    "formación", "formacion", "libros", "idiomas", "curso", "udemy", 
    "coursera", "escuela", "universidad"
  ],
  "Ropa & Personal": [
    "ropa", "calzado", "zapatillas", "peluquería", "peluqueria", 
    "higiene", "barber", "perfumeria"
  ],
  "Tecnología": [
    "amazon", "vercel", "netlify", "github", "openai", "anthropic", 
    "claude", "chatgpt", "elevenlabs", "loom", "temu", "apple", 
    "software", "cloud", "hosting", "microsoft", "google"
  ],
  "Otros": [],
};

const EXPENSE_SUBKEYWORDS: { [key: string]: string[] } = {
  "Supermercado": ["mercadona", "condis", "bonpreu", "carrefour", "lidl", "aldi", "dia", "bonpan"],
  "Restaurantes": ["restaurant", "mcdonalds", "honest greens", "tagliatella", "kfc", "burger", "viena", "osaka", "sabai", "raise", "carbonara", "tanto gusto"],
  "Delivery": ["glovo", "deliveroo", "just eat", "ubereats"],
  "Gasolina": ["esclatoil", "benzinera", "gasolina", "combustible", "bonpreu smartfuel"],
  "Streaming": ["netflix", "spotify", "hbo", "disney", "prime video", "youtube"],
  "Software": ["openai", "anthropic", "claude", "chatgpt", "vercel", "netlify", "github"],
  "Hardware": ["amazon", "apple", "mediamarkt", "fnac"],
};

function normalizeText(text: string | undefined | null): string {
  if (!text) return "";
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function findMatchingCategory(concept: string, observaciones: string, isIncome: boolean): { category: string; subcategory: string } {
  const text = normalizeText(`${concept} ${observaciones}`);
  
  const keywords = isIncome ? INCOME_KEYWORDS : EXPENSE_KEYWORDS;
  
  for (const [category, categoryKeywords] of Object.entries(keywords)) {
    if (categoryKeywords.length === 0) continue;
    
    for (const keyword of categoryKeywords) {
      if (text.includes(normalizeText(keyword))) {
        if (!isIncome) {
          const subcategory = findMatchingSubcategory(text);
          return { category, subcategory };
        }
        return { category, subcategory: "" };
      }
    }
  }
  
  return { category: isIncome ? "Ingresos Ocasionales" : "Otros", subcategory: "" };
}

function findMatchingSubcategory(text: string): string {
  for (const [subcategory, subKeywords] of Object.entries(EXPENSE_SUBKEYWORDS)) {
    for (const keyword of subKeywords) {
      if (text.includes(normalizeText(keyword))) {
        return subcategory;
      }
    }
  }
  return "";
}

export function parseBBVAExcel(file: ArrayBuffer): ParsedMovement[] {
  const workbook = XLSX.read(file, { type: "array", cellDates: true });
  
  // Find the right sheet - look for one with "Importe" or "Movimiento"
  let sheetName = workbook.SheetNames[0];
  for (const name of workbook.SheetNames) {
    const ws = workbook.Sheets[name];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as (string | number | null)[][];
    const hasImporte = data.some(row => row?.some(cell => String(cell ?? "").toLowerCase().includes("importe")));
    if (hasImporte) {
      sheetName = name;
      break;
    }
  }
  
  console.log("Available sheets:", workbook.SheetNames);
  console.log("Using sheet:", sheetName);
  
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number | null)[][];
  
  // Debug output
  console.log("Excel rows:", data.length, "cols:", data[5]?.length);
  console.log("Sample row[5]:", data[5]);
  
  const movements: ParsedMovement[] = [];
  
  // Find the header row dynamically
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(data.length, 10); i++) {
    const row = data[i];
    if (row && row.some((cell) => String(cell ?? "").toLowerCase().includes("importe"))) {
      headerRowIndex = i;
      break;
    }
  }
  console.log("Header row index:", headerRowIndex);
  
  // Start parsing after header row
  const startIndex = headerRowIndex >= 0 ? headerRowIndex + 1 : 0;
  
  for (let i = startIndex; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 5) continue;
    
    // Column mapping based on actual Excel structure:
    // col0: fecha valor, col1: fecha, col2: concepto, col3: tipo, col4: importe, col5: divisa
    const colFecha = String(row[0] ?? "").trim();
    const colConcepto = String(row[2] ?? "").trim();
    const colTipo = String(row[3] ?? "").trim();
    const colImporte = row[4];
    const colObs = row[8] ? String(row[8]).trim() : "";
    
    // Skip header rows and empty rows
    if (!colImporte) continue;
    if (typeof colImporte !== "number") continue;
    if (colConcepto === "Concepto" || colFecha === "Fecha") continue;
    
    const isIncome = colImporte > 0;
    const { category, subcategory } = findMatchingCategory(colConcepto, colObs, isIncome);
    
    let fechaFormateada: string;
    if (colFecha && colFecha.includes("/")) {
      fechaFormateada = colFecha;
    } else {
      fechaFormateada = colFecha;
    }
    
    movements.push({
      fecha: fechaFormateada,
      concepto: colConcepto || "Sin concepto",
      tipo: colTipo || "Otros",
      importe: colImporte,
      observaciones: colObs,
      categoriaSugerida: category,
      subcategoriaSugerida: subcategory,
    });
  }
  
  return movements;
}

export function generateMovementHash(fecha: string, importe: number, concepto: string): string {
  const normalized = normalizeText(concepto);
  const data = `${fecha}|${importe}|${normalized}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
