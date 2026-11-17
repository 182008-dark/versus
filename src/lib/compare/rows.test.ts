import { describe, expect, it } from "vitest";
import { products } from "@/data/catalog";
import { compareRows, formatCompat, formatStorage, homeRows } from "./rows";

const product = (code: string) => {
  const found = products.find((p) => p.code === code);
  if (!found) throw new Error(code);
  return found;
};

describe("lignes du comparateur", () => {
  it.each(["phones", "audio", "wearables"] as const)(
    "la famille %s a exactement 6 lignes clés pour l'accueil, prix compris",
    (group) => {
      const rows = homeRows(group);
      expect(rows).toHaveLength(6);
      expect(rows[0]?.key).toBe("price");
      expect(new Set(compareRows[group].map((row) => row.key)).size).toBe(
        compareRows[group].length,
      );
    },
  );

  it("formate les décimales et la compatibilité en français", () => {
    const screen = compareRows.phones.find((row) => row.key === "screen");
    expect(screen?.format(product("ip18"))).toBe("6,3 pouces OLED");
    expect(screen?.format(product("rn15"))).toBe("6,83 pouces AMOLED");
    const autonomy = compareRows.audio.find((row) => row.key === "autonomy");
    expect(autonomy?.format(product("xb6"))).toBe("3,5 h");
    expect(formatCompat(["ios", "android"])).toBe("iPhone (iOS) · Android");
  });

  it("préfixe le prix de « Dès » seulement quand les variantes ont plusieurs prix", () => {
    const price = compareRows.audio.find((row) => row.key === "price");
    expect(price?.format(product("ap5"))?.replace(/\s/g, " ")).toBe("98 000 FCFA");
    expect(price?.format(product("ip18"))?.replace(/\s/g, " ")).toBe("Dès 970 000 FCFA");
  });

  it("affiche l'autonomie en jours au-delà de 72 h et calcule le stockage", () => {
    const autonomy = compareRows.wearables.find((row) => row.key === "autonomy");
    expect(autonomy?.format(product("rw6"))).toBe("24 jours");
    const storage = compareRows.phones.find((row) => row.key === "storage");
    expect(storage?.format(product("ip18"))).toBe("256 Go · 512 Go");
    expect(storage?.format(product("ipd"))).toBe("256 Go · 512 Go · 1 To · 2 To");
  });

  it("exprime les capacités d'au moins 1 024 Go en To", () => {
    expect(formatStorage(512)).toBe("512 Go");
    expect(formatStorage(1024)).toBe("1 To");
    expect(formatStorage(2048)).toBe("2 To");
  });
});
