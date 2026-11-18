import { describe, expect, it } from "vitest";
import { MAX_CART_LINES } from "./cart-reducer";
import { quoteRequestSchema } from "./schema";

const valid = { lines: [{ sku: "IP18-BOR-512", qty: 2 }], zone: "lome" };

describe("quoteRequestSchema (entrées de priceCart)", () => {
  it("accepte des SKU et des quantités, avec ou sans zone", () => {
    expect(quoteRequestSchema.parse(valid)).toEqual(valid);
    expect(quoteRequestSchema.parse({ lines: [], zone: null })).toEqual({ lines: [], zone: null });
  });

  it("refuse tout prix venant du navigateur", () => {
    const withPrice = { lines: [{ sku: "IP18-BOR-512", qty: 2, price_fcfa: 1 }], zone: null };
    expect(quoteRequestSchema.safeParse(withPrice).success).toBe(false);
    expect(quoteRequestSchema.safeParse({ ...valid, total_fcfa: 1 }).success).toBe(false);
  });

  it.each([
    ["quantité nulle", { lines: [{ sku: "IP18-BOR-512", qty: 0 }], zone: null }],
    ["quantité au-delà de 5", { lines: [{ sku: "IP18-BOR-512", qty: 6 }], zone: null }],
    ["quantité décimale", { lines: [{ sku: "IP18-BOR-512", qty: 1.5 }], zone: null }],
    ["quantité en texte", { lines: [{ sku: "IP18-BOR-512", qty: "2" }], zone: null }],
    ["SKU en minuscules", { lines: [{ sku: "ip18-bor-512", qty: 1 }], zone: null }],
    ["SKU trop court", { lines: [{ sku: "IP", qty: 1 }], zone: null }],
    ["zone mal formée", { lines: [], zone: "Lomé" }],
    ["zone absente", { lines: [] }],
    ["lignes absentes", { zone: null }],
    [
      `plus de ${MAX_CART_LINES} lignes`,
      {
        lines: Array.from({ length: MAX_CART_LINES + 1 }, (_, i) => ({ sku: `SKU-${i}`, qty: 1 })),
        zone: null,
      },
    ],
    ["valeur qui n'est pas un objet", "IP18-BOR-512"],
  ])("refuse : %s", (_label, input) => {
    expect(quoteRequestSchema.safeParse(input).success).toBe(false);
  });
});
