import type { UserPreferences } from "@/types";

/**
 * Formatea un importe según las preferencias del usuario.
 * Usar en TODOS los lugares donde se muestre dinero.
 */
export function formatCurrency(
  amount: number,
  preferences: Pick<
    UserPreferences,
    "currency_symbol" | "symbol_position" | "decimal_format"
  >
): string {
  const { currency_symbol, symbol_position, decimal_format } = preferences;

  const isComma = decimal_format === "comma";

  // Formateamos con 2 decimales
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toFixed(2);

  // Separamos parte entera y decimal
  const [intPart, decPart] = formatted.split(".");

  // Añadir separador de miles
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, isComma ? "." : ",");

  // Separador decimal
  const decSep = isComma ? "," : ".";
  const numStr = `${intFormatted}${decSep}${decPart}`;

  // Añadir signo negativo si corresponde
  const sign = amount < 0 ? "-" : "";

  // Posición del símbolo
  if (symbol_position === "before") {
    return `${sign}${currency_symbol}${numStr}`;
  }
  return `${sign}${numStr} ${currency_symbol}`;
}

/** Preferencias por defecto (EUR, símbolo después, coma decimal) */
export const DEFAULT_PREFERENCES: Pick<
  UserPreferences,
  "currency_symbol" | "symbol_position" | "decimal_format"
> = {
  currency_symbol: "€",
  symbol_position: "after",
  decimal_format: "comma",
};
