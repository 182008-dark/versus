import { describe, expect, it } from "vitest";
import { homeSlots, products } from "./catalog";

describe("catalogue de démonstration", () => {
  it("contient neuf produits, avec une variante par défaut et une image sourcée par produit", () => {
    expect(products).toHaveLength(9);
    for (const product of products) {
      expect(product.variants.filter((variant) => variant.is_default)).toHaveLength(1);
      expect(product.image_src).toMatch(/^\/products\/[a-z0-9]+\.png$/);
      expect(product.image_width).toBeGreaterThan(0);
      expect(product.image_height).toBeGreaterThan(0);
      expect(product.min_price_fcfa).toBe(
        Math.min(
          ...product.variants.filter((variant) => variant.is_active).map((v) => v.price_fcfa),
        ),
      );
    }
  });

  it("définit les sélections de la maquette et un ordre unique par emplacement", () => {
    expect(
      homeSlots.filter((slot) => slot.slot === "hero").map((slot) => slot.product_code),
    ).toEqual(["ip18", "gw9", "rn15"]);
    expect(
      homeSlots.filter((slot) => slot.slot === "tile").map((slot) => slot.product_code),
    ).toEqual(["a57", "ap5", "gb4", "aw12", "rw6"]);
    expect(new Set(homeSlots.map((slot) => `${slot.slot}:${slot.position}`)).size).toBe(
      homeSlots.length,
    );
  });
});
