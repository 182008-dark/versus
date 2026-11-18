import { maxQuantityPerLine, type DeliveryZoneOption } from "@/config/policies";
import type { ProductDetail } from "@/lib/catalog/types";
import type { CartQuote, CartQuoteLine, QuoteErrorCode, QuoteIssue, QuoteItem } from "./quote";
import { SKU_PATTERN } from "./sku";

/**
 * Calcul du devis de panier, transcription TypeScript de `private.compute_quote` (§5.8, ADR 003).
 * Fonction pure : la source des prix, des stocks et des zones est injectée. À l'étape 4, la même
 * logique tourne dans Postgres et ce fichier ne sert plus que de référence et de test d'écart.
 */

/** Ce que la base sait d'une variante : `product_variants` joint à `products`. */
export type QuoteVariant = Pick<
  CartQuoteLine,
  | "sku"
  | "name"
  | "slug"
  | "variant_label"
  | "color_hex"
  | "brand_slug"
  | "visual_kind"
  | "image_src"
  | "image_width"
  | "image_height"
  | "stock"
> & { price_fcfa: number; is_active: boolean; product_active: boolean };

export type QuoteSource = {
  variant(sku: string): QuoteVariant | undefined;
  zone(code: string): DeliveryZoneOption | undefined;
  /** `shop_settings.max_qty_per_line`. */
  maxQtyPerLine: number;
};

/** Erreur levée comme la RPC (`raise exception … message = 'VS_…'`). */
export class QuoteError extends Error {
  constructor(readonly code: QuoteErrorCode) {
    super(code);
    this.name = "QuoteError";
  }
}

const MAX_ITEMS = 100;
const QTY_PATTERN = /^[1-9][0-9]{0,3}$/;
const PRICE_PATTERN = /^[0-9]{1,9}$/;

/** Mêmes contrôles que la RPC : la fonction ne fait confiance à aucune entrée. */
function assertItems(items: unknown): asserts items is readonly QuoteItem[] {
  if (!Array.isArray(items) || items.length > MAX_ITEMS) throw new QuoteError("VS_INVALID");
  for (const item of items as unknown[]) {
    if (typeof item !== "object" || item === null) throw new QuoteError("VS_INVALID");
    const { sku, qty, price_fcfa } = item as Record<string, unknown>;
    const valid =
      typeof sku === "string" &&
      SKU_PATTERN.test(sku) &&
      Number.isInteger(qty) &&
      QTY_PATTERN.test(String(qty)) &&
      (price_fcfa === undefined ||
        (Number.isInteger(price_fcfa) && PRICE_PATTERN.test(String(price_fcfa))));
    if (!valid) throw new QuoteError("VS_INVALID");
  }
}

export function computeQuote(
  items: readonly QuoteItem[],
  zoneCode: string | null,
  source: QuoteSource,
): CartQuote {
  assertItems(items);
  const zone = zoneCode === null ? undefined : source.zone(zoneCode);
  if (zoneCode !== null && !zone) throw new QuoteError("VS_INVALID_ZONE");

  // Regroupement par SKU (somme des quantités, plus grand prix de référence), trié par SKU.
  const grouped = new Map<string, { qty: number; reference: number | undefined }>();
  for (const { sku, qty, price_fcfa } of items) {
    const current = grouped.get(sku);
    grouped.set(sku, {
      qty: (current?.qty ?? 0) + qty,
      reference:
        price_fcfa === undefined
          ? current?.reference
          : Math.max(price_fcfa, current?.reference ?? price_fcfa),
    });
  }

  let subtotal = 0;
  let valid = true;
  const lines = [...grouped.keys()].toSorted().map((sku): CartQuoteLine => {
    const { qty: requested, reference } = grouped.get(sku)!;
    const variant = source.variant(sku);
    const qty = Math.min(requested, source.maxQtyPerLine);
    const issues: QuoteIssue[] = requested > source.maxQtyPerLine ? ["qty_capped"] : [];
    const display = {
      sku,
      name: variant?.name ?? sku,
      slug: variant?.slug ?? null,
      variant_label: variant?.variant_label ?? null,
      color_hex: variant?.color_hex ?? null,
      brand_slug: variant?.brand_slug ?? null,
      visual_kind: variant?.visual_kind ?? null,
      image_src: variant?.image_src ?? null,
      image_width: variant?.image_width ?? null,
      image_height: variant?.image_height ?? null,
      qty,
    };

    if (!variant || !variant.is_active || !variant.product_active) {
      valid = false;
      issues.push("unavailable");
      return { ...display, stock: 0, price_fcfa: null, line_total_fcfa: 0, issues };
    }
    if (reference !== undefined && reference !== variant.price_fcfa) issues.push("price_changed");
    if (variant.stock < qty) {
      valid = false;
      issues.push("insufficient_stock");
    }
    const lineTotal = variant.price_fcfa * qty;
    subtotal += lineTotal;
    return {
      ...display,
      stock: variant.stock,
      price_fcfa: variant.price_fcfa,
      line_total_fcfa: lineTotal,
      issues,
    };
  });

  const fee =
    zone === undefined
      ? 0
      : zone.free_from_fcfa !== null && subtotal >= zone.free_from_fcfa
        ? 0
        : zone.fee_fcfa;

  return {
    lines,
    subtotal_fcfa: subtotal,
    delivery_fee_fcfa: fee,
    total_fcfa: subtotal + fee,
    zone_code: zone?.code ?? null,
    zone_label: zone?.label ?? null,
    eta_label: zone?.eta_label ?? null,
    valid,
  };
}

/** Source de devis lue dans le catalogue statique (`src/data/catalog.ts`) et `policies.ts`. */
export function quoteSourceFromCatalog(
  products: readonly ProductDetail[],
  zones: readonly DeliveryZoneOption[],
): QuoteSource {
  const variants = new Map<string, QuoteVariant>();
  for (const product of products) {
    for (const variant of product.variants) {
      variants.set(variant.sku, {
        sku: variant.sku,
        name: product.name,
        slug: product.slug,
        variant_label: variant.color_name,
        color_hex: variant.color_hex,
        brand_slug: product.brand_slug,
        visual_kind: product.visual_kind,
        image_src: product.image_src,
        image_width: product.image_width,
        image_height: product.image_height,
        stock: variant.stock,
        price_fcfa: variant.price_fcfa,
        is_active: variant.is_active,
        // Le catalogue statique ne publie que des produits actifs (vue `catalog_products`).
        product_active: true,
      });
    }
  }
  const zonesByCode = new Map(zones.map((zone) => [zone.code as string, zone]));
  return {
    variant: (sku) => variants.get(sku),
    zone: (code) => zonesByCode.get(code),
    maxQtyPerLine: maxQuantityPerLine,
  };
}
