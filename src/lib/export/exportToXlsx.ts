import * as XLSX from "xlsx";
import type { IncomeEntry, ExpenseEntry } from "@/types";

type ExportType = "ingresos" | "gastos" | "completo";

interface ExportData {
  ingresos?: IncomeEntry[];
  gastos?: ExpenseEntry[];
  month: number;
  year: number;
}

const MONTH_NAMES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function buildIngresosSheet(ingresos: IncomeEntry[]) {
  const headers = ["Fecha", "Concepto", "Categoría", "Importe", "Recurrente", "Notas"];
  const rows = ingresos.map((e) => [
    e.date,
    e.concept,
    e.category?.name ?? "",
    e.amount,
    e.is_recurring ? "Sí" : "No",
    e.notes ?? "",
  ]);

  const total = ingresos.reduce((s, e) => s + e.amount, 0);
  rows.push(["", "", "TOTAL", total, "", ""]);

  return [headers, ...rows];
}

function buildGastosSheet(gastos: ExpenseEntry[]) {
  const headers = ["Fecha", "Concepto", "Categoría", "Subcategoría", "Bloque", "Importe", "Recurrente", "Notas"];
  const rows = gastos.map((e) => [
    e.date,
    e.concept,
    e.category?.name ?? "",
    e.subcategory?.name ?? "",
    e.category?.rule_block ?? e.subcategory?.rule_block ?? "",
    e.amount,
    e.is_recurring ? "Sí" : "No",
    e.notes ?? "",
  ]);

  const total = gastos.reduce((s, e) => s + e.amount, 0);
  rows.push(["", "", "", "", "TOTAL", total, "", ""]);

  return [headers, ...rows];
}

export function exportToXlsx(
  tipo: ExportType,
  data: ExportData
): void {
  const wb = XLSX.utils.book_new();
  const monthLabel = `${MONTH_NAMES[data.month]} ${data.year}`;

  if (tipo === "ingresos" || tipo === "completo") {
    const rows = buildIngresosSheet(data.ingresos ?? []);
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 12 }, { wch: 30 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws, "Ingresos");
  }

  if (tipo === "gastos" || tipo === "completo") {
    const rows = buildGastosSheet(data.gastos ?? []);
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 12 }, { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws, "Gastos");
  }

  if (tipo === "completo") {
    // Summary sheet
    const ingresoTotal = (data.ingresos ?? []).reduce((s, e) => s + e.amount, 0);
    const gastoTotal = (data.gastos ?? []).reduce((s, e) => s + e.amount, 0);
    const ahorro = ingresoTotal - gastoTotal;

    const summaryRows = [
      ["Resumen — " + monthLabel],
      [],
      ["Concepto", "Importe"],
      ["Ingresos totales", ingresoTotal],
      ["Gastos totales", gastoTotal],
      ["Ahorro generado", ahorro],
      ["Tasa de ahorro", ingresoTotal > 0 ? `${((ahorro / ingresoTotal) * 100).toFixed(1)}%` : "—"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(summaryRows);
    ws["!cols"] = [{ wch: 22 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, ws, "Resumen");
  }

  const filename = `control-financiero_${tipo}_${data.year}-${String(data.month).padStart(2, "0")}.xlsx`;
  XLSX.writeFile(wb, filename);
}
