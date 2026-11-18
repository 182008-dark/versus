import { describe, expect, it } from "vitest";
import { deliveryZoneOptions, deliveryZones, freeDeliveryLomeFromFcfa } from "@/config/policies";
import { products } from "@/data/catalog";
import type { ProductDetail, ProductVariant } from "@/lib/catalog/types";
import {
  computeQuote,
  QuoteError,
  quoteSourceFromCatalog,
  type QuoteSource,
} from "./compute-quote";

const source = quoteSourceFromCatalog(products, deliveryZoneOptions);

/** Prix et stock lus dans le catalogue, pour ne jamais recopier un montant à la main. */
function catalogVariant(sku: string): ProductVariant {
  const found = products.flatMap((product) => product.variants).find((v) => v.sku === sku);
  if (!found) throw new Error(`SKU absent du catalogue : ${sku}`);
  return found;
}

const IP18_512 = catalogVariant("IP18-BOR-512");
const GW9_40 = catalogVariant("GW9-40-GRA");

describe("quoteCart : prix serveur", () => {
  it("calcule chaque ligne avec le prix du catalogue, jamais avec un prix fourni", () => {
    const quote = computeQuote([{ sku: "IP18-BOR-512", qty: 2 }], null, source);
    expect(quote.lines).toEqual([
      {
        sku: "IP18-BOR-512",
        name: "iPhone 18 Pro",
        slug: "iphone-18-pro",
        variant_label: "Bordeaux · 512 Go",
        color_hex: IP18_512.color_hex,
        brand_slug: "apple",
        visual_kind: "phone",
        image_src: "/products/ip18.png",
        image_width: 505,
        image_height: 600,
        qty: 2,
        stock: IP18_512.stock,
        price_fcfa: IP18_512.price_fcfa,
        line_total_fcfa: IP18_512.price_fcfa * 2,
        issues: [],
      },
    ]);
    expect(quote.subtotal_fcfa).toBe(IP18_512.price_fcfa * 2);
    expect(quote.valid).toBe(true);
  });

  it("un prix de référence différent signale price_changed sans changer le montant", () => {
    const quote = computeQuote([{ sku: "IP18-BOR-512", qty: 1, price_fcfa: 1 }], null, source);
    expect(quote.lines[0]?.issues).toEqual(["price_changed"]);
    expect(quote.lines[0]?.price_fcfa).toBe(IP18_512.price_fcfa);
    expect(quote.total_fcfa).toBe(IP18_512.price_fcfa);
    // price_changed n'invalide pas le panier : le nouveau prix est simplement affiché.
    expect(quote.valid).toBe(true);
  });

  it("additionne les doublons d'un même SKU et trie les lignes par SKU (comme la RPC)", () => {
    const quote = computeQuote(
      [
        { sku: "IP18-BOR-512", qty: 1 },
        { sku: "GW9-40-GRA", qty: 1 },
        { sku: "IP18-BOR-512", qty: 1 },
      ],
      null,
      source,
    );
    expect(quote.lines.map(({ sku, qty }) => [sku, qty])).toEqual([
      ["GW9-40-GRA", 1],
      ["IP18-BOR-512", 2],
    ]);
  });
});

describe("quoteCart : écarts", () => {
  it("SKU inconnu : unavailable, ligne à zéro, panier invalide", () => {
    const quote = computeQuote(
      [
        { sku: "INCONNU-1", qty: 1 },
        { sku: "GW9-40-GRA", qty: 1 },
      ],
      null,
      source,
    );
    expect(quote.lines[1]).toMatchObject({
      sku: "INCONNU-1",
      name: "INCONNU-1",
      slug: null,
      stock: 0,
      price_fcfa: null,
      line_total_fcfa: 0,
      issues: ["unavailable"],
    });
    expect(quote.subtotal_fcfa).toBe(GW9_40.price_fcfa);
    expect(quote.valid).toBe(false);
  });

  it("stock insuffisant : insufficient_stock, panier invalide (variante épuisée du catalogue)", () => {
    const soldOut = catalogVariant("IP18-BOR-256");
    expect(soldOut.stock).toBe(0);
    const quote = computeQuote([{ sku: "IP18-BOR-256", qty: 1 }], null, source);
    expect(quote.lines[0]?.issues).toEqual(["insufficient_stock"]);
    expect(quote.lines[0]?.stock).toBe(0);
    expect(quote.valid).toBe(false);
  });

  it("plafonne la quantité à la limite par ligne (qty_capped), sans invalider", () => {
    const quote = computeQuote([{ sku: "GW9-40-GRA", qty: 9 }], null, source);
    expect(quote.lines[0]).toMatchObject({ qty: 5, issues: ["qty_capped"] });
    expect(quote.subtotal_fcfa).toBe(GW9_40.price_fcfa * 5);
    expect(quote.valid).toBe(true);
  });

  it("cumule les écarts d'une ligne (plafond puis stock)", () => {
    const tiny: QuoteSource = {
      ...source,
      variant: (sku) =>
        sku === "PEU-1"
          ? { ...source.variant("GW9-40-GRA")!, sku: "PEU-1", stock: 2 }
          : source.variant(sku),
    };
    const quote = computeQuote([{ sku: "PEU-1", qty: 8 }], null, tiny);
    expect(quote.lines[0]).toMatchObject({ qty: 5, issues: ["qty_capped", "insufficient_stock"] });
    expect(quote.valid).toBe(false);
  });

  it("variante ou produit inactif : unavailable", () => {
    const inactive: QuoteSource = {
      ...source,
      variant: (sku) => {
        const found = source.variant(sku);
        if (sku === "GW9-40-GRA" && found) return { ...found, is_active: false };
        if (sku === "IP18-BOR-512" && found) return { ...found, product_active: false };
        return found;
      },
    };
    const quote = computeQuote(
      [
        { sku: "GW9-40-GRA", qty: 1 },
        { sku: "IP18-BOR-512", qty: 1 },
      ],
      null,
      inactive,
    );
    expect(quote.lines.map((line) => line.issues)).toEqual([["unavailable"], ["unavailable"]]);
    // Le nom du produit reste affiché pour expliquer ce qui a disparu.
    expect(quote.lines[0]?.name).toBe("Galaxy Watch9");
    expect(quote.subtotal_fcfa).toBe(0);
  });
});

describe("quoteCart : zones et frais de livraison (D6)", () => {
  it("expose six zones, aux tarifs des trois groupes de la page Livraison", () => {
    expect(deliveryZoneOptions.map((zone) => zone.code)).toEqual([
      "lome",
      "maritime",
      "plateaux",
      "centrale",
      "kara",
      "savanes",
    ]);
    const fees = new Set(deliveryZones.map((zone) => zone.feeFcfa));
    for (const zone of deliveryZoneOptions) expect(fees.has(zone.fee_fcfa)).toBe(true);
  });

  it("sans zone : pas de frais ni de délai", () => {
    const quote = computeQuote([{ sku: "GW9-40-GRA", qty: 1 }], null, source);
    expect(quote).toMatchObject({
      delivery_fee_fcfa: 0,
      zone_code: null,
      zone_label: null,
      eta_label: null,
    });
  });

  it("applique les frais de la zone choisie et son délai", () => {
    for (const zone of deliveryZoneOptions.filter((z) => z.free_from_fcfa === null)) {
      const quote = computeQuote([{ sku: "GW9-40-GRA", qty: 1 }], zone.code, source);
      expect(quote.delivery_fee_fcfa).toBe(zone.fee_fcfa);
      expect(quote.eta_label).toBe(zone.eta_label);
      expect(quote.zone_label).toBe(zone.label);
      expect(quote.zone_code).toBe(zone.code);
    }
  });

  it("offre la livraison à Lomé à partir du seuil, pas en dessous", () => {
    const lome = deliveryZoneOptions.find((zone) => zone.code === "lome")!;
    const cheap = cheapestVariant();
    expect(cheap.price_fcfa).toBeLessThan(freeDeliveryLomeFromFcfa);
    const below = computeQuote([{ sku: cheap.sku, qty: 1 }], "lome", source);
    expect(below.delivery_fee_fcfa).toBe(lome.fee_fcfa);
    const above = computeQuote([{ sku: "IP18-BOR-512", qty: 1 }], "lome", source);
    expect(above.subtotal_fcfa).toBeGreaterThanOrEqual(freeDeliveryLomeFromFcfa);
    expect(above.delivery_fee_fcfa).toBe(0);
  });

  it("refuse une zone inconnue (VS_INVALID_ZONE)", () => {
    expect(() => computeQuote([], "mars", source)).toThrow(QuoteError);
    try {
      computeQuote([], "mars", source);
    } catch (error) {
      expect((error as QuoteError).code).toBe("VS_INVALID_ZONE");
    }
  });
});

describe("quoteCart : total", () => {
  it("total = somme des lignes + frais", () => {
    const quote = computeQuote(
      [
        { sku: "IP18-BOR-512", qty: 2 },
        { sku: "GW9-40-GRA", qty: 3 },
      ],
      "kara",
      source,
    );
    const expectedSubtotal = IP18_512.price_fcfa * 2 + GW9_40.price_fcfa * 3;
    expect(quote.subtotal_fcfa).toBe(expectedSubtotal);
    expect(quote.lines.reduce((sum, line) => sum + line.line_total_fcfa, 0)).toBe(expectedSubtotal);
    expect(quote.total_fcfa).toBe(expectedSubtotal + 5000);
  });

  it("panier vide : sous-total nul, valide", () => {
    expect(computeQuote([], null, source)).toEqual({
      lines: [],
      subtotal_fcfa: 0,
      delivery_fee_fcfa: 0,
      total_fcfa: 0,
      zone_code: null,
      zone_label: null,
      eta_label: null,
      valid: true,
    });
  });
});

describe("quoteCart : entrées invalides (VS_INVALID)", () => {
  it.each([
    ["pas un tableau", { sku: "GW9-40-GRA", qty: 1 }],
    ["SKU mal formé", [{ sku: "gw9", qty: 1 }]],
    ["quantité nulle", [{ sku: "GW9-40-GRA", qty: 0 }]],
    ["quantité décimale", [{ sku: "GW9-40-GRA", qty: 1.5 }]],
    ["quantité démesurée", [{ sku: "GW9-40-GRA", qty: 10_000 }]],
    ["prix négatif", [{ sku: "GW9-40-GRA", qty: 1, price_fcfa: -1 }]],
    ["plus de 100 lignes", Array.from({ length: 101 }, () => ({ sku: "GW9-40-GRA", qty: 1 }))],
  ])("%s", (_label, items) => {
    expect(() => computeQuote(items as never, null, source)).toThrow(
      expect.objectContaining({ code: "VS_INVALID" }),
    );
  });
});

function cheapestVariant(): ProductVariant {
  return (products as readonly ProductDetail[])
    .flatMap((product) => product.variants)
    .filter((variant) => variant.is_active && variant.stock > 0)
    .reduce((min, variant) => (variant.price_fcfa < min.price_fcfa ? variant : min));
}
