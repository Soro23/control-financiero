import { describe, it, expect } from "vitest";
import { calcularBloques, calcularDesviacion, generarInsightTexto } from "./rule503020";
import type { Category, ExpenseEntry } from "@/types";

function makeCat(id: string, rule_block: "needs" | "wants"): Category {
  return {
    id, user_id: "u1", type: "expense", name: id,
    parent_id: null, rule_block,
    is_default: true, is_active: true, sort_order: 1,
    created_at: new Date().toISOString(),
  };
}

function makeExpense(category_id: string, amount: number): ExpenseEntry {
  return {
    id: crypto.randomUUID(), user_id: "u1", category_id,
    subcategory_id: null, concept: "Test", amount,
    date: "2025-04-01", is_recurring: false, notes: null,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
}

describe("calcularBloques", () => {
  const cats = [makeCat("vivienda", "needs"), makeCat("ocio", "wants")];

  it("needs acumula gastos con rule_block=needs", () => {
    const gastos = [makeExpense("vivienda", 500), makeExpense("ocio", 300)];
    const blocks = calcularBloques(2000, gastos, cats);
    expect(blocks.needs.actual).toBe(500);
    expect(blocks.wants.actual).toBe(300);
  });

  it("ideal de needs = 50% de ingresos", () => {
    const blocks = calcularBloques(2000, [], cats);
    expect(blocks.needs.ideal).toBe(1000);
  });

  it("ideal de wants = 30% de ingresos", () => {
    const blocks = calcularBloques(2000, [], cats);
    expect(blocks.wants.ideal).toBe(600);
  });

  it("ideal de savings = 20% de ingresos", () => {
    const blocks = calcularBloques(2000, [], cats);
    expect(blocks.savings.ideal).toBe(400);
  });

  it("savings = 0 cuando gastos = ingresos", () => {
    const gastos = [makeExpense("vivienda", 2000)];
    const blocks = calcularBloques(2000, gastos, cats);
    expect(blocks.savings.actual).toBe(0);
  });
});

describe("calcularDesviacion", () => {
  it("ok cuando real < 80% del ideal", () => {
    expect(calcularDesviacion(400, 1000).status).toBe("ok");
  });

  it("warning cuando real está entre 80% y 99% del ideal", () => {
    expect(calcularDesviacion(850, 1000).status).toBe("warning");
  });

  it("over cuando real >= 100% del ideal", () => {
    expect(calcularDesviacion(1100, 1000).status).toBe("over");
  });

  it("valor = diferencia real - ideal", () => {
    expect(calcularDesviacion(1200, 1000).valor).toBe(200);
  });
});

describe("generarInsightTexto", () => {
  it("devuelve string no vacío en cualquier estado", () => {
    const cats = [makeCat("v", "needs")];

    const bloques1 = calcularBloques(2000, [makeExpense("v", 1500)], cats);
    expect(generarInsightTexto(bloques1).length).toBeGreaterThan(0);

    const bloques2 = calcularBloques(2000, [], cats);
    expect(generarInsightTexto(bloques2).length).toBeGreaterThan(0);
  });
});
