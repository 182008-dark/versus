import { describe, expect, it } from "vitest";
import { NBSP, formatFCFA, formatFCFAParts } from "./fcfa";

describe("formatFCFA", () => {
  it("sépare les milliers par une espace fine insécable (U+202F) et termine par U+00A0 FCFA", () => {
    expect(formatFCFA(849000)).toBe("849 000 FCFA");
  });

  it("formate les petits et les grands montants", () => {
    expect(formatFCFA(0)).toBe("0 FCFA");
    expect(formatFCFA(1500)).toBe("1 500 FCFA");
    expect(formatFCFA(1234567)).toBe("1 234 567 FCFA");
  });

  it("n'affiche aucune décimale", () => {
    expect(formatFCFA(1499.6)).toBe("1 500 FCFA");
  });

  it("refuse un montant non fini", () => {
    expect(() => formatFCFA(Number.NaN)).toThrow(RangeError);
    expect(() => formatFCFA(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe("formatFCFAParts", () => {
  it("sépare le montant (milliers en U+202F) de l'unité", () => {
    expect(formatFCFAParts(970000)).toEqual({ amount: "970 000", unit: "FCFA" });
  });

  it("recompose exactement formatFCFA avec une espace insécable", () => {
    for (const amount of [0, 32000, 970000, 1534000]) {
      const parts = formatFCFAParts(amount);
      expect(`${parts.amount}${NBSP}${parts.unit}`).toBe(formatFCFA(amount));
    }
    expect(NBSP).toBe(" ");
  });

  it("refuse un montant non fini", () => {
    expect(() => formatFCFAParts(Number.NaN)).toThrow(RangeError);
  });
});
