import type { IncomeEntry, ExpenseEntry, DashboardKPIs } from "@/types";
import { calcularVariacion as varIngresos } from "./ingresos";
import { calcularVariacion as varGastos } from "./gastos";

export function calcularKPIs(
  totalIngresos: number,
  totalGastos: number,
  totalIngresosAnterior: number,
  totalGastosAnterior: number
): DashboardKPIs {
  const ingresosMes = totalIngresos;
  const gastosMes = totalGastos;
  const ahorroGenerado = ingresosMes - gastosMes;
  const pctAhorro = ingresosMes > 0 ? (ahorroGenerado / ingresosMes) * 100 : 0;

  const ingresosMesAnterior = totalIngresosAnterior;
  const gastosMesAnterior = totalGastosAnterior;
  const ahorroAnterior = ingresosMesAnterior - gastosMesAnterior;

  return {
    ingresosMes,
    gastosMes,
    ahorroGenerado,
    pctAhorro,
    tendenciaIngresos: varIngresos(ingresosMes, ingresosMesAnterior),
    tendenciaGastos: varGastos(gastosMes, gastosMesAnterior),
    tendenciaAhorro: varIngresos(ahorroGenerado, ahorroAnterior),
  };
}
