import type { DeliveryZoneOption } from "@/config/policies";
import type { Brand, DeviceKind } from "@/lib/brand-themes";

/**
 * Contrat du devis de panier : celui de la RPC `public.quote_cart(p_items jsonb, p_zone_code text)`
 * (§5.8 du plan, ADR 003). Les noms suivent les colonnes de la base (`snake_case`, `_fcfa`).
 * Aujourd'hui, `static-quoter.ts` le calcule sur le catalogue statique ; à l'étape 4, la RPC
 * renverra exactement ce JSON et seul `quoter.ts` changera.
 */

/**
 * Écarts signalés sur une ligne :
 * - `unavailable` : SKU inconnu, variante ou produit inactif (ligne à 0, panier invalide) ;
 * - `insufficient_stock` : le stock ne couvre pas la quantité (panier invalide) ;
 * - `qty_capped` : quantité ramenée à la limite par ligne ;
 * - `price_changed` : le prix de référence fourni par le serveur appelant diffère du prix actuel.
 */
export const QUOTE_ISSUES = [
  "unavailable",
  "insufficient_stock",
  "qty_capped",
  "price_changed",
] as const;
export type QuoteIssue = (typeof QUOTE_ISSUES)[number];

/**
 * Une ligne envoyée au calcul (`p_items`). `price_fcfa` est un prix de **référence** facultatif,
 * fourni par le serveur (récapitulatif de commande, étape 6) pour détecter `price_changed` : il
 * ne sert jamais au calcul, et le navigateur ne peut pas l'envoyer (`schema.ts` le refuse).
 */
export type QuoteItem = { sku: string; qty: number; price_fcfa?: number };

export type CartQuoteLine = {
  sku: string;
  /** Nom du produit (le SKU si la variante est inconnue). */
  name: string;
  slug: string | null;
  /** Coloris, capacité ou taille (`product_variants.color_name`). */
  variant_label: string | null;
  /**
   * Teinte du coloris (`product_variants.color_hex`) : la vignette la montre en pastille, car la
   * photo (`image_src`, celle du produit) n'est pas forcément celle de ce coloris.
   */
  color_hex: string | null;
  brand_slug: Brand | null;
  visual_kind: DeviceKind | null;
  image_src: string | null;
  image_width: number | null;
  image_height: number | null;
  /** Quantité retenue (plafonnée à la limite par ligne). */
  qty: number;
  stock: number;
  /** Prix unitaire actuel lu par le serveur ; `null` si indisponible. */
  price_fcfa: number | null;
  line_total_fcfa: number;
  issues: QuoteIssue[];
};

export type CartQuote = {
  /** Une ligne par SKU (doublons additionnés), triées par SKU comme la RPC. */
  lines: CartQuoteLine[];
  subtotal_fcfa: number;
  /** 0 sans zone, ou au-delà du seuil de gratuité de la zone. */
  delivery_fee_fcfa: number;
  total_fcfa: number;
  zone_code: string | null;
  /** Nom de la zone (`delivery_zones.label`) : « Lomé et environs ». */
  zone_label: string | null;
  /** Délai de la zone (`delivery_zones.eta_label`) : « 24 à 48 h ». */
  eta_label: string | null;
  /** Faux dès qu'une ligne est `unavailable` ou `insufficient_stock`. */
  valid: boolean;
};

/** Erreurs de la RPC (`raise exception … message = 'VS_…'`). */
export type QuoteErrorCode = "VS_INVALID" | "VS_INVALID_ZONE";

/**
 * Adresse de la fiche et vignette d'une ligne, préparées par la Server Action (hors contrat de la
 * RPC) : le navigateur n'a ainsi à charger ni la table des routes (`routeFor`) ni l'optimiseur
 * d'images de `next/image` (budget JavaScript de la page panier).
 */
export type CartLineMedia = {
  /** `null` si la variante est inconnue ou la route des fiches non livrée. */
  href: string | null;
  /** Image optimisée (64 px, 128 px en densité 2), `null` sans visuel. */
  src: string | null;
  srcSet: string | null;
};

/** Résultat de la Server Action `priceCart` (gabarit du §3.4) : `media` est indexé par SKU. */
export type PriceCartResult =
  | { ok: true; data: CartQuote; media: Record<string, CartLineMedia> }
  | { ok: false; code: QuoteErrorCode | "VS_UNAVAILABLE" };

/**
 * Point d'accès unique au calcul du panier (côté serveur). Implémenté par `staticCartQuoter`
 * (catalogue statique) ; à l'étape 4, par un adaptateur de la RPC `quote_cart` et de la table
 * `delivery_zones`, sans toucher aux composants.
 */
export interface CartQuoter {
  quote(items: readonly QuoteItem[], zoneCode: string | null): Promise<CartQuote>;
  listZones(): Promise<readonly DeliveryZoneOption[]>;
}
