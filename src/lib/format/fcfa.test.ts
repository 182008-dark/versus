import { describe, expect, it } from "vitest";
import { formatFCFA } from "./fcfa";

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
