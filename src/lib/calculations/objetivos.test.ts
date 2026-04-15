import { describe, it, expect } from "vitest";
import {
  calcularProgreso,
  calcularMesesRestantes,
  calcularAportacionNecesaria,
} from "./objetivos";

describe("calcularProgreso", () => {
  it("0% cuando accumulated = 0", () => {
    expect(calcularProgreso(0, 1000)).toBe(0);
  });

  it("50% cuando accumulated = target / 2", () => {
    expect(calcularProgreso(500, 1000)).toBe(50);
  });

  it("100% cuando accumulated = target", () => {
    expect(calcularProgreso(1000, 1000)).toBe(100);
  });

  it("tope en 100% cuando accumulated > target", () => {
    expect(calcularProgreso(1500, 1000)).toBe(100);
  });

  it("0% cuando target <= 0", () => {
    expect(calcularProgreso(500, 0)).toBe(0);
  });
});

describe("calcularMesesRestantes", () => {
  it("null cuando monthlyContribution = 0", () => {
    expect(calcularMesesRestantes(1000, 0)).toBeNull();
  });

  it("null cuando monthlyContribution < 0", () => {
    expect(calcularMesesRestantes(1000, -50)).toBeNull();
  });

  it("redondea hacia arriba", () => {
    // 1000 / 300 = 3.33 → ceil = 4
    expect(calcularMesesRestantes(1000, 300)).toBe(4);
  });

  it("exacto cuando es divisible", () => {
    expect(calcularMesesRestantes(1000, 500)).toBe(2);
  });

  it("1 mes cuando remaining < monthlyContribution", () => {
    expect(calcularMesesRestantes(100, 500)).toBe(1);
  });
});

describe("calcularAportacionNecesaria", () => {
  it("null cuando deadline ya pasó", () => {
    const past = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString();
    expect(calcularAportacionNecesaria(1000, past)).toBeNull();
  });

  it("número positivo cuando deadline es futuro", () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString();
    const result = calcularAportacionNecesaria(1000, future);
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThan(0);
  });

  it("aportación mayor cuando deadline más cercano", () => {
    const near = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
    const far  = new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString();
    const aNear = calcularAportacionNecesaria(1000, near)!;
    const aFar  = calcularAportacionNecesaria(1000, far)!;
    expect(aNear).toBeGreaterThan(aFar);
  });
});
