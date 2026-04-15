import { describe, it, expect } from "vitest";
import { calcularTotalMes, calcularPorcentajePorCategoria, calcularVariacion } from "./ingresos";
import type { IncomeEntry, Category } from "@/types";

function makeEntry(amount: number, category_id = "cat1"): IncomeEntry {
  return {
    id: crypto.randomUUID(),
    user_id: "u1",
    category_id,
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
    type: "income",
    name,
    parent_id: null,
    rule_block: null,
    is_default: true,
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  };
}

describe("calcularTotalMes", () => {
  it("devuelve 0 con array vacío", () => {
    expect(calcularTotalMes([])).toBe(0);
  });

  it("devuelve el importe de un solo ingreso", () => {
    expect(calcularTotalMes([makeEntry(1000)])).toBe(1000);
  });

  it("suma correctamente N ingresos", () => {
    const entries = [makeEntry(500), makeEntry(300), makeEntry(200)];
    expect(calcularTotalMes(entries)).toBe(1000);
  });
});

describe("calcularPorcentajePorCategoria", () => {
  it("devuelve array vacío si no hay ingresos", () => {
    expect(calcularPorcentajePorCategoria([], [])).toHaveLength(0);
  });

  it("un solo ingreso → 100%", () => {
    const entries = [makeEntry(500, "cat1")];
    const categories = [makeCategory("cat1", "Salario")];
    const result = calcularPorcentajePorCategoria(entries, categories);
    expect(result).toHaveLength(1);
    expect(result[0].pct).toBe(100);
  });

  it("suma de porcentajes = 100", () => {
    const entries = [makeEntry(600, "cat1"), makeEntry(400, "cat2")];
    const categories = [makeCategory("cat1", "Salario"), makeCategory("cat2", "Freelance")];
    const result = calcularPorcentajePorCategoria(entries, categories);
    const totalPct = result.reduce((s, r) => s + r.pct, 0);
    expect(totalPct).toBeCloseTo(100, 5);
  });
});

describe("calcularVariacion", () => {
  it("neutral cuando actual y anterior son 0", () => {
    const t = calcularVariacion(0, 0);
    expect(t.direction).toBe("neutral");
  });

  it("up cuando actual > anterior", () => {
    const t = calcularVariacion(1200, 1000);
    expect(t.direction).toBe("up");
    expect(t.pct).toBeCloseTo(20);
  });

  it("down cuando actual < anterior", () => {
    const t = calcularVariacion(800, 1000);
    expect(t.direction).toBe("down");
    expect(t.pct).toBeCloseTo(20);
  });

  it("anterior 0 con actual > 0 → up 100%", () => {
    const t = calcularVariacion(500, 0);
    expect(t.direction).toBe("up");
    expect(t.pct).toBe(100);
  });
});
