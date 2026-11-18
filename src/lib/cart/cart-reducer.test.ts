import { describe, expect, it } from "vitest";
import { maxQuantityPerLine } from "@/config/policies";
import { cartCount, cartReducer, MAX_CART_LINES, type CartLine } from "./cart-reducer";

const two: CartLine[] = [
  { sku: "IP18-BOR-512", qty: 2 },
  { sku: "GW9-40-GRA", qty: 1 },
];

describe("cartReducer : ajout", () => {
  it("ajoute une nouvelle ligne avec une quantité de 1 par défaut", () => {
    expect(cartReducer([], { type: "add", sku: "IP18-BOR-512" })).toEqual([
      { sku: "IP18-BOR-512", qty: 1 },
    ]);
  });

  it("fusionne par SKU : un second ajout augmente la quantité au lieu de créer une ligne", () => {
    const state = cartReducer(two, { type: "add", sku: "IP18-BOR-512", qty: 2 });
    expect(state).toEqual([
      { sku: "IP18-BOR-512", qty: 4 },
      { sku: "GW9-40-GRA", qty: 1 },
    ]);
  });

  it("plafonne la quantité à la limite par ligne (5, réglage D6)", () => {
    expect(maxQuantityPerLine).toBe(5);
    const state = cartReducer(two, { type: "add", sku: "IP18-BOR-512", qty: 9 });
    expect(state[0]).toEqual({ sku: "IP18-BOR-512", qty: 5 });
  });

  it("plafonne aussi au stock connu, et n'ajoute rien quand il est épuisé", () => {
    expect(cartReducer([], { type: "add", sku: "A", qty: 4, max: 2 })).toEqual([
      { sku: "A", qty: 2 },
    ]);
    expect(cartReducer(two, { type: "add", sku: "IP18-BOR-256", max: 0 })).toBe(two);
  });

  it("renvoie le même état quand la ligne est déjà au plafond", () => {
    const full: CartLine[] = [{ sku: "A", qty: 5 }];
    expect(cartReducer(full, { type: "add", sku: "A" })).toBe(full);
  });

  it(`n'ajoute pas de ${MAX_CART_LINES + 1}e ligne`, () => {
    const lines = Array.from({ length: MAX_CART_LINES }, (_, i) => ({ sku: `SKU-${i}`, qty: 1 }));
    expect(cartReducer(lines, { type: "add", sku: "SKU-NEW" })).toBe(lines);
    // Une ligne existante reste modifiable.
    expect(cartReducer(lines, { type: "add", sku: "SKU-0" })[0]).toEqual({ sku: "SKU-0", qty: 2 });
  });

  it("ignore une quantité non entière ou négative", () => {
    expect(cartReducer(two, { type: "add", sku: "A", qty: 1.5 })).toBe(two);
    expect(cartReducer(two, { type: "add", sku: "A", qty: -1 })).toBe(two);
  });
});

describe("cartReducer : quantité", () => {
  it("fixe une quantité bornée de 1 à 5", () => {
    expect(cartReducer(two, { type: "setQty", sku: "GW9-40-GRA", qty: 3 })[1]?.qty).toBe(3);
    expect(cartReducer(two, { type: "setQty", sku: "GW9-40-GRA", qty: 12 })[1]?.qty).toBe(5);
    expect(cartReducer(two, { type: "setQty", sku: "GW9-40-GRA", qty: 0 })[1]?.qty).toBe(1);
  });

  it("borne au stock, et retire la ligne d'une variante épuisée", () => {
    expect(cartReducer(two, { type: "setQty", sku: "IP18-BOR-512", qty: 4, max: 3 })[0]?.qty).toBe(
      3,
    );
    expect(cartReducer(two, { type: "setQty", sku: "IP18-BOR-512", qty: 1, max: 0 })).toEqual([
      { sku: "GW9-40-GRA", qty: 1 },
    ]);
  });

  it("ne crée pas de ligne pour un SKU absent", () => {
    expect(cartReducer(two, { type: "setQty", sku: "INCONNU", qty: 2 })).toBe(two);
  });
});

describe("cartReducer : retrait, vidage, remplacement", () => {
  it("retire une ligne", () => {
    expect(cartReducer(two, { type: "remove", sku: "IP18-BOR-512" })).toEqual([
      { sku: "GW9-40-GRA", qty: 1 },
    ]);
    expect(cartReducer(two, { type: "remove", sku: "INCONNU" })).toBe(two);
  });

  it("vide le panier", () => {
    expect(cartReducer(two, { type: "clear" })).toEqual([]);
  });

  it("remplace l'état (autre onglet, relecture du stockage)", () => {
    const next = [{ sku: "A57-NOI-128", qty: 1 }];
    expect(cartReducer(two, { type: "replace", lines: next })).toEqual(next);
  });
});

describe("cartCount", () => {
  it("additionne les quantités", () => {
    expect(cartCount(two)).toBe(3);
    expect(cartCount([])).toBe(0);
  });
});
