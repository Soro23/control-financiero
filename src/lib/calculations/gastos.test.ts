import { describe, it, expect } from "vitest";
import { calcularTotalMes, calcularPorcentajePorCategoria, calcularVariacion } from "./gastos";
import type { ExpenseEntry, Category } from "@/types";

function makeEntry(amount: number, category_id = "cat1"): ExpenseEntry {
  return {
    id: crypto.randomUUID(),
    user_id: "u1",
    category_id,
    subcategory_id: null,
    concept: "Test",
    amount,
    date: "2025-04-01",
    is_recurring: false,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function makeCategory(id: string, name: string): Category {
  return {
    id,
    user_id: "u1",
    type: "expense",
    name,
    parent_id: null,
    rule_block: "needs",
    is_default: true,
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  };
}

describe("calcularTotalMes (gastos)", () => {
  it("devuelve 0 con array vacío", () => {
    expect(calcularTotalMes([])).toBe(0);
  });

  it("devuelve el importe de un solo gasto", () => {
    expect(calcularTotalMes([makeEntry(250)])).toBe(250);
  });

  it("suma correctamente N gastos", () => {
    const entries = [makeEntry(100), makeEntry(200), makeEntry(50)];
    expect(calcularTotalMes(entries)).toBe(350);
  });
});

describe("calcularPorcentajePorCategoria (gastos)", () => {
  it("devuelve vacío si no hay gastos", () => {
    expect(calcularPorcentajePorCategoria([], [])).toHaveLength(0);
  });

  it("un solo gasto → 100%", () => {
    const entries = [makeEntry(300, "cat1")];
    const cats = [makeCategory("cat1", "Vivienda")];
    const result = calcularPorcentajePorCategoria(entries, cats);
    expect(result[0].pct).toBe(100);
  });

  it("dos categorías → porcentajes suman 100", () => {
    const entries = [makeEntry(700, "cat1"), makeEntry(300, "cat2")];
    const cats = [makeCategory("cat1", "Vivienda"), makeCategory("cat2", "Alimentación")];
    const result = calcularPorcentajePorCategoria(entries, cats);
    const total = result.reduce((s, r) => s + r.pct, 0);
    expect(total).toBeCloseTo(100, 5);
  });

  it("ordena de mayor a menor", () => {
    const entries = [makeEntry(200, "cat1"), makeEntry(800, "cat2")];
    const cats = [makeCategory("cat1", "A"), makeCategory("cat2", "B")];
    const result = calcularPorcentajePorCategoria(entries, cats);
    expect(result[0].total).toBeGreaterThan(result[1].total);
  });
});

describe("calcularVariacion (gastos)", () => {
  it("up cuando gastos aumentan", () => {
    expect(calcularVariacion(500, 400).direction).toBe("up");
  });

  it("down cuando gastos disminuyen", () => {
    expect(calcularVariacion(300, 400).direction).toBe("down");
  });
});
