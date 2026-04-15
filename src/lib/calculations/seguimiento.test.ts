import { describe, it, expect } from "vitest";
import { getTrackingStatus, buildTrackingData, generateInsights } from "./seguimiento";
import type { Category, ExpenseEntry } from "@/types";

describe("getTrackingStatus", () => {
  it("0% → good", ()   => expect(getTrackingStatus(0)).toBe("good"));
  it("50% → good", ()  => expect(getTrackingStatus(50)).toBe("good"));
  it("79% → good", ()  => expect(getTrackingStatus(79)).toBe("good"));
  it("80% → warning",  () => expect(getTrackingStatus(80)).toBe("warning"));
  it("99% → warning",  () => expect(getTrackingStatus(99)).toBe("warning"));
  it("100% → over",    () => expect(getTrackingStatus(100)).toBe("over"));
  it("135% → over",    () => expect(getTrackingStatus(135)).toBe("over"));
});

function makeCat(id: string, name: string): Category {
  return {
    id, user_id: "u1", type: "expense", name,
    parent_id: null, rule_block: "needs",
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

describe("buildTrackingData", () => {
  it("devuelve entrada por cada categoría padre activa", () => {
    const cats = [makeCat("c1", "Vivienda"), makeCat("c2", "Alimentación")];
    const budget = { c1: 500, c2: 300 };
    const gastos = [makeExpense("c1", 400)];
    const result = buildTrackingData(cats, budget, gastos);
    expect(result).toHaveLength(2);
  });

  it("calcula pct correctamente", () => {
    const cats = [makeCat("c1", "Vivienda")];
    const budget = { c1: 1000 };
    const gastos = [makeExpense("c1", 500)];
    const result = buildTrackingData(cats, budget, gastos);
    expect(result[0].pct).toBe(50);
  });

  it("pct 100 cuando no hay presupuesto pero sí gasto", () => {
    const cats = [makeCat("c1", "Vivienda")];
    const result = buildTrackingData(cats, {}, [makeExpense("c1", 200)]);
    expect(result[0].pct).toBe(100);
  });
});

describe("generateInsights", () => {
  it("genera danger cuando categoría supera presupuesto", () => {
    const tracking = [{
      categoryId: "c1", categoryName: "Vivienda", ruleBlock: "needs" as const,
      budgeted: 500, actual: 700, pct: 140, status: "over" as const,
    }];
    const insights = generateInsights(tracking);
    expect(insights.some((i) => i.type === "danger")).toBe(true);
  });

  it("genera warning cuando categoría está al 80–99%", () => {
    const tracking = [{
      categoryId: "c1", categoryName: "Vivienda", ruleBlock: "needs" as const,
      budgeted: 500, actual: 450, pct: 90, status: "warning" as const,
    }];
    const insights = generateInsights(tracking);
    expect(insights.some((i) => i.type === "warning")).toBe(true);
  });

  it("genera success cuando categoría está muy por debajo", () => {
    const tracking = [{
      categoryId: "c1", categoryName: "Ocio", ruleBlock: "wants" as const,
      budgeted: 200, actual: 40, pct: 20, status: "good" as const,
    }];
    const insights = generateInsights(tracking);
    expect(insights.some((i) => i.type === "success")).toBe(true);
  });
});
