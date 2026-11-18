import { describe, expect, it, vi } from "vitest";
import { products } from "@/data/catalog";

// `server-only` lève une erreur hors du graphe serveur de Next : neutralisé pour Vitest.
vi.mock("server-only", () => ({}));

const { priceCart } = await import("./cart");

const ip18 = products.find((product) => product.code === "ip18")!;
const variant = ip18.variants.find((v) => v.sku === "IP18-BOR-512")!;

describe("priceCart (Server Action)", () => {
  it("renvoie le devis calculé avec les prix du serveur", async () => {
    const result = await priceCart({ lines: [{ sku: "IP18-BOR-512", qty: 2 }], zone: "maritime" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.lines[0]?.price_fcfa).toBe(variant.price_fcfa);
    expect(result.data.subtotal_fcfa).toBe(variant.price_fcfa * 2);
    expect(result.data.delivery_fee_fcfa).toBe(3500);
    expect(result.data.total_fcfa).toBe(variant.price_fcfa * 2 + 3500);
  });

  it("donne l'adresse de la fiche et une vignette optimisée de chaque ligne", async () => {
    const result = await priceCart({
      lines: [
        { sku: "IP18-BOR-512", qty: 1 },
        { sku: "SUPPRIME-1", qty: 1 },
      ],
      zone: null,
    });
    if (!result.ok) throw new Error(result.code);
    expect(result.media["IP18-BOR-512"]).toMatchObject({ href: "/produit/iphone-18-pro" });
    expect(result.media["IP18-BOR-512"]?.src).toMatch(/^\/_next\/image\?url=/);
    expect(result.media["SUPPRIME-1"]).toEqual({ href: null, src: null, srcSet: null });
  });

  it("refuse un prix envoyé par le navigateur (VS_INVALID)", async () => {
    expect(
      await priceCart({ lines: [{ sku: "IP18-BOR-512", qty: 1, price_fcfa: 1 }], zone: null }),
    ).toEqual({ ok: false, code: "VS_INVALID" });
  });

  it("refuse une entrée mal formée sans lever d'exception", async () => {
    expect(await priceCart(null)).toEqual({ ok: false, code: "VS_INVALID" });
    expect(await priceCart({ lines: [{ sku: "IP18-BOR-512", qty: 9 }], zone: null })).toEqual({
      ok: false,
      code: "VS_INVALID",
    });
  });

  it("traduit une zone inconnue en VS_INVALID_ZONE", async () => {
    expect(await priceCart({ lines: [], zone: "mars" })).toEqual({
      ok: false,
      code: "VS_INVALID_ZONE",
    });
  });

  it("signale un SKU inconnu dans le devis plutôt que d'échouer", async () => {
    const result = await priceCart({ lines: [{ sku: "SUPPRIME-1", qty: 1 }], zone: null });
    expect(result.ok && result.data.lines[0]?.issues).toEqual(["unavailable"]);
    expect(result.ok && result.data.valid).toBe(false);
  });
});
