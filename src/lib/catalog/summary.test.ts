import { describe, expect, it } from "vitest";
import { brands, products } from "@/data/catalog";
import { brandNames, productCount } from "./summary";

describe("résumé du catalogue", () => {
  it("accorde le nombre de produits", () => {
    expect(productCount(1)).toBe("1 produit");
    expect(productCount(products.length)).toBe("30 produits");
  });

  it("énumère les marques en français", () => {
    expect(brandNames(brands)).toBe("Apple, Samsung et Xiaomi");
    expect(brandNames(brands.slice(0, 2))).toBe("Apple et Samsung");
  });
});
