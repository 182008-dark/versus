import { describe, expect, it } from "vitest";
import { MAX_CART_LINES } from "./cart-reducer";
import {
  CART_STORAGE_KEY,
  CART_STORAGE_VERSION,
  parseStoredCart,
  serializeCart,
  writeStoredCart,
} from "./storage";

const stored = (value: unknown) => JSON.stringify(value);

describe("stockage du panier : version", () => {
  it("utilise une clé et une charge versionnées", () => {
    expect(CART_STORAGE_KEY).toBe("versus.cart.v1");
    expect(CART_STORAGE_VERSION).toBe(1);
    const raw = serializeCart({ lines: [{ sku: "IP18-BOR-512", qty: 2 }], zone: "lome" });
    expect(JSON.parse(raw)).toEqual({
      version: 1,
      lines: [{ sku: "IP18-BOR-512", qty: 2 }],
      zone: "lome",
    });
  });

  it("relit ce qu'il a écrit", () => {
    const cart = { lines: [{ sku: "GW9-40-GRA", qty: 1 }], zone: null };
    expect(parseStoredCart(serializeCart(cart))).toEqual({ ...cart, status: "ok" });
  });

  it("repart d'un panier vide sans rien enregistré", () => {
    expect(parseStoredCart(null)).toEqual({ lines: [], zone: null, status: "empty" });
  });

  it("écarte une autre version au lieu de deviner son format", () => {
    expect(
      parseStoredCart(stored({ version: 2, lines: [{ sku: "A57-NOI-128", qty: 1 }] })),
    ).toEqual({ lines: [], zone: null, status: "reset" });
  });
});

describe("stockage du panier : données corrompues", () => {
  it.each([
    ["JSON illisible", "{"],
    ["valeur nulle", "null"],
    ["tableau", "[]"],
    ["lignes absentes", stored({ version: 1 })],
    ["lignes qui ne sont pas un tableau", stored({ version: 1, lines: "IP18" })],
  ])("vide le panier : %s", (_label, raw) => {
    expect(parseStoredCart(raw)).toEqual({ lines: [], zone: null, status: "reset" });
  });

  it("ne garde que SKU et quantité : un prix écrit à la main est ignoré", () => {
    const result = parseStoredCart(
      stored({ version: 1, lines: [{ sku: "IP18-BOR-512", qty: 2, price_fcfa: 1 }] }),
    );
    expect(result.lines).toEqual([{ sku: "IP18-BOR-512", qty: 2 }]);
    expect(JSON.stringify(result)).not.toContain("price");
  });

  it("répare : lignes invalides retirées, doublons fusionnés, quantités plafonnées", () => {
    const result = parseStoredCart(
      stored({
        version: 1,
        lines: [
          { sku: "IP18-BOR-512", qty: 2 },
          { sku: "<script>", qty: 1 },
          { sku: "GW9-40-GRA", qty: "3" },
          { sku: "GW9-44-GRA", qty: 0 },
          { sku: "IP18-BOR-512", qty: 2 },
          { sku: "A57-NOI-128", qty: 40 },
          null,
        ],
        zone: "Lomé !",
      }),
    );
    expect(result).toEqual({
      lines: [
        { sku: "IP18-BOR-512", qty: 4 },
        { sku: "A57-NOI-128", qty: 5 },
      ],
      zone: null,
      status: "repaired",
    });
  });

  it(`tronque au-delà de ${MAX_CART_LINES} lignes`, () => {
    const lines = Array.from({ length: MAX_CART_LINES + 5 }, (_, i) => ({
      sku: `SKU-${i}`,
      qty: 1,
    }));
    const result = parseStoredCart(stored({ version: 1, lines }));
    expect(result.lines).toHaveLength(MAX_CART_LINES);
    expect(result.status).toBe("repaired");
  });
});

describe("stockage du panier : écriture", () => {
  function fakeStorage(setItem: (key: string, value: string) => void) {
    return { setItem } as Pick<Storage, "setItem">;
  }

  it("écrit sous la clé versionnée", () => {
    const writes: [string, string][] = [];
    const error = writeStoredCart(
      fakeStorage((key, value) => writes.push([key, value])),
      { lines: [{ sku: "IP18-BOR-512", qty: 1 }], zone: null },
    );
    expect(error).toBeNull();
    expect(writes[0]?.[0]).toBe(CART_STORAGE_KEY);
  });

  it("signale un quota dépassé sans lever d'exception", () => {
    const quota = new DOMException("plein", "QuotaExceededError");
    const error = writeStoredCart(
      fakeStorage(() => {
        throw quota;
      }),
      { lines: [], zone: null },
    );
    expect(error).toBe("quota");
  });

  it("signale un stockage indisponible (navigation privée, stockage bloqué)", () => {
    expect(writeStoredCart(undefined, { lines: [], zone: null })).toBe("unavailable");
    expect(
      writeStoredCart(
        fakeStorage(() => {
          throw new DOMException("refusé", "SecurityError");
        }),
        { lines: [], zone: null },
      ),
    ).toBe("unavailable");
  });
});
