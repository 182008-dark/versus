import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CART_STORAGE_KEY } from "./storage";

/** Le magasin garde son état dans le module : chaque test repart d'un module neuf. */
async function freshStore() {
  vi.resetModules();
  return import("./cart-store");
}

beforeEach(() => window.localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("magasin du panier", () => {
  it("lit le stockage au premier accès et compte les articles", async () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ version: 1, lines: [{ sku: "IP18-BOR-512", qty: 2 }], zone: "kara" }),
    );
    const { getCartSnapshot } = await freshStore();
    expect(getCartSnapshot()).toEqual({
      lines: [{ sku: "IP18-BOR-512", qty: 2 }],
      zone: "kara",
      count: 2,
      notice: null,
    });
  });

  it("réécrit des données corrompues et le signale", async () => {
    window.localStorage.setItem(CART_STORAGE_KEY, "{pas du json");
    const { getCartSnapshot } = await freshStore();
    expect(getCartSnapshot()).toMatchObject({ lines: [], notice: "reset" });
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!)).toEqual({
      version: 1,
      lines: [],
      zone: null,
    });
  });

  it("enregistre chaque modification et prévient les abonnés", async () => {
    const { updateCart, setCartZone, subscribeCart, getCartSnapshot } = await freshStore();
    const listener = vi.fn();
    subscribeCart(listener);
    updateCart({ type: "add", sku: "GW9-40-GRA" });
    updateCart({ type: "add", sku: "GW9-40-GRA" });
    setCartZone("lome");
    expect(listener).toHaveBeenCalledTimes(3);
    expect(getCartSnapshot().count).toBe(2);
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!)).toEqual({
      version: 1,
      lines: [{ sku: "GW9-40-GRA", qty: 2 }],
      zone: "lome",
    });
  });

  it("ne prévient personne quand rien ne change", async () => {
    const { updateCart, subscribeCart } = await freshStore();
    const listener = vi.fn();
    subscribeCart(listener);
    updateCart({ type: "remove", sku: "ABSENT-1" });
    expect(listener).not.toHaveBeenCalled();
  });

  it("signale un quota dépassé et garde le panier en mémoire", async () => {
    const { updateCart } = await freshStore();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("plein", "QuotaExceededError");
    });
    expect(updateCart({ type: "add", sku: "GW9-40-GRA" })).toMatchObject({
      count: 1,
      notice: "quota",
    });
  });

  it("se synchronise avec un autre onglet (événement storage)", async () => {
    const { getCartSnapshot, subscribeCart } = await freshStore();
    getCartSnapshot();
    const listener = vi.fn();
    subscribeCart(listener);
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ version: 1, lines: [{ sku: "A57-NOI-128", qty: 3 }], zone: null }),
    );
    window.dispatchEvent(new StorageEvent("storage", { key: CART_STORAGE_KEY }));
    expect(listener).toHaveBeenCalledOnce();
    expect(getCartSnapshot().count).toBe(3);
  });
});
