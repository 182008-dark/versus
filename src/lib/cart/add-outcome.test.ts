import { describe, expect, it } from "vitest";
import { addOutcome } from "./add-outcome";

describe("addOutcome", () => {
  const name = "iPhone 18 Pro (Bordeaux · 512 Go)";
  const sku = "IP18-BOR-512";

  it("annonce un ajout réel, avec la quantité au-delà de 1", () => {
    expect(addOutcome([], [{ sku, qty: 1 }], sku, name, 3)).toEqual({
      status: "added",
      message: `${name} ajouté au panier.`,
    });
    expect(addOutcome([{ sku, qty: 1 }], [{ sku, qty: 2 }], sku, name, 3).message).toBe(
      `${name} ajouté au panier (quantité : 2).`,
    );
  });

  it("dit que la quantité maximale est atteinte quand rien ne change", () => {
    const lines = [{ sku, qty: 3 }];
    expect(addOutcome(lines, lines, sku, name, 3)).toEqual({
      status: "max",
      message: `Quantité maximale atteinte pour ${name} : 3 au panier.`,
    });
  });

  it("dit que le panier est plein (20 articles différents)", () => {
    const lines = Array.from({ length: 20 }, (_, i) => ({ sku: `SKU-${i}`, qty: 1 }));
    expect(addOutcome(lines, lines, sku, name, 3).status).toBe("full");
  });

  it("dit qu'une variante épuisée n'est pas ajoutée", () => {
    expect(addOutcome([], [], sku, name, 0)).toEqual({
      status: "soldOut",
      message: `${name} est épuisé.`,
    });
  });
});
