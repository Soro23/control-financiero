/**
 * Formatea una fecha (string ISO o Date) según el formato configurado.
 * Formatos soportados: 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'
 */
export function formatDate(
  date: string | Date,
  format: string = "DD/MM/YYYY"
): string {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear());

  switch (format) {
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    default: // DD/MM/YYYY
      return `${day}/${month}/${year}`;
  }
}

/** Devuelve la fecha de hoy en formato YYYY-MM-DD (para inputs date) */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/** Nombre del mes en español */
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function monthYearLabel(month: number, year: number): string {
  return `${MESES[month - 1]} ${year}`;
}
