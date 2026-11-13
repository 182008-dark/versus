import { describe, expect, it } from "vitest";
import { primitives } from "@/data/design-tokens";
import { contrastRatio, formatRatio, parseHex, relativeLuminance, wcagLevel } from "./contrast";

// Les littéraux hexadécimaux sont interdits hors de la liste blanche (check:forbidden) :
// les couleurs de ce test sont écrites sans « # » (parseHex l'accepte) ou lues dans les tokens.
const { white, black } = primitives;
const accent = primitives["green-600"];
const accentHover = primitives["green-700"];
const accentOnDark = primitives["green-300"];
const night = primitives["night-900"];

describe("parseHex", () => {
  it("lit #rrggbb, rrggbb et rgb, sans tenir compte de la casse", () => {
    expect(parseHex(accent)).toEqual({ r: 0, g: 128, b: 90 });
    expect(parseHex("fff")).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHex("1d1d1f")).toEqual({ r: 29, g: 29, b: 31 });
  });

  it("refuse une valeur qui n'est pas une couleur hexadécimale", () => {
    expect(() => parseHex("vert")).toThrow(/invalide/);
    expect(() => parseHex("12345")).toThrow();
  });
});

describe("relativeLuminance", () => {
  it("vaut 0 pour le noir et 1 pour le blanc", () => {
    expect(relativeLuminance(black)).toBe(0);
    expect(relativeLuminance(white)).toBe(1);
  });

  it("utilise le seuil de linéarisation sRGB (0,04045)", () => {
    // Composante 10/255 ≈ 0,0392 : partie linéaire (c / 12,92).
    expect(relativeLuminance({ r: 10, g: 10, b: 10 })).toBeCloseTo(10 / 255 / 12.92, 10);
  });
});

describe("contrastRatio", () => {
  it("vaut 21 entre le noir et le blanc, 1 entre deux couleurs identiques", () => {
    expect(contrastRatio(black, white)).toBeCloseTo(21, 10);
    expect(contrastRatio(accent, accent)).toBe(1);
  });

  it("ne dépend pas de l'ordre des couleurs", () => {
    expect(contrastRatio(accent, white)).toBe(contrastRatio(white, accent));
  });

  it("donne les valeurs de référence connues", () => {
    // 767676 est le gris le plus clair qui passe AA sur blanc (4,54:1).
    expect(contrastRatio("767676", white)).toBeCloseTo(4.54, 2);
    expect(contrastRatio("777777", white)).toBeLessThan(4.5);
  });

  it("l'accent VERSUS atteint AA avec du blanc, survolé ou non (D1)", () => {
    expect(contrastRatio(accent, white)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(accentHover, white)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(accentOnDark, night)).toBeGreaterThanOrEqual(7);
  });
});

describe("wcagLevel", () => {
  it("applique les seuils du texte courant", () => {
    expect(wcagLevel(7)).toBe("AAA");
    expect(wcagLevel(4.5)).toBe("AA");
    expect(wcagLevel(4.499)).toBe("AA grand texte");
    expect(wcagLevel(3)).toBe("AA grand texte");
    expect(wcagLevel(2.99)).toBe("Insuffisant");
  });

  it("applique les seuils du grand texte", () => {
    expect(wcagLevel(4.5, { largeText: true })).toBe("AAA");
    expect(wcagLevel(3, { largeText: true })).toBe("AA");
    expect(wcagLevel(2.9, { largeText: true })).toBe("Insuffisant");
  });
});

describe("formatRatio", () => {
  it("affiche le ratio à la française, tronqué à deux décimales", () => {
    expect(formatRatio(21)).toBe("21,00:1");
    expect(formatRatio(4.4999)).toBe("4,49:1");
    expect(formatRatio(4.958)).toBe("4,95:1");
  });
});
