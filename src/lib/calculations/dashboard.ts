import type { IncomeEntry, ExpenseEntry, DashboardKPIs } from "@/types";
import { calcularTotalMes as totalIngresos, calcularVariacion as varIngresos } from "./ingresos";
import { calcularTotalMes as totalGastos, calcularVariacion as varGastos } from "./gastos";

export function calcularKPIs(
  ingresos: IncomeEntry[],
  gastos: ExpenseEntry[],
  ingresosAnterior: IncomeEntry[],
  gastosAnterior: ExpenseEntry[]
): DashboardKPIs {
  const ingresosMes = totalIngresos(ingresos);
  const gastosMes = totalGastos(gastos);
  const ahorroGenerado = ingresosMes - gastosMes;
  const pctAhorro = ingresosMes > 0 ? (ahorroGenerado / ingresosMes) * 100 : 0;

  const ingresosMesAnterior = totalIngresos(ingresosAnterior);
  const gastosMesAnterior = totalGastos(gastosAnterior);
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
