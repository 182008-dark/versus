/**
 * Valeurs métier affichées par les pages d'information (livraison, CGV, garantie).
 *
 * Ce sont les propositions de la décision D6 du plan (à confirmer avant l'étape 6). À l'étape 6,
 * le serveur (Postgres) devient la source de vérité des frais : `lib/delivery/fees.ts` reprendra
 * ces valeurs pour l'estimation affichée, et ce fichier sera relu contre la base.
 * Montants en FCFA entiers, affichés uniquement avec `formatFCFA()`.
 */

export type DeliveryZone = {
  name: string;
  /** Frais de livraison en FCFA. */
  feeFcfa: number;
  /** Délai indicatif après confirmation du paiement (ou de la commande, pour la livraison). */
  delay: string;
};

export const deliveryZones: DeliveryZone[] = [
  { name: "Lomé et environs", feeFcfa: 1500, delay: "24 à 48 h" },
  { name: "Régions Maritime et Plateaux", feeFcfa: 3500, delay: "2 à 4 jours ouvrés" },
  { name: "Régions Centrale, Kara et Savanes", feeFcfa: 5000, delay: "3 à 6 jours ouvrés" },
];

/** Livraison offerte à Lomé à partir de ce montant de commande. */
export const freeDeliveryLomeFromFcfa = 300_000;

/** Plafond d'une commande payée à la livraison. */
export const cashOnDeliveryCapFcfa = 500_000;

/** Délai pour régler une commande par mobile money avant son annulation automatique. */
export const paymentWindowMinutes = 30;

/** Délai de retour d'un produit non ouvert (simulation). */
export const returnWindowDays = 7;

/**
 * Quantité maximale d'une même variante dans le panier (`shop_settings.max_qty_per_line`, §5.5).
 * Le panier local la respecte, et le serveur la réapplique (`qty_capped`).
 */
export const maxQuantityPerLine = 5;

/** Code d'une zone de livraison (`delivery_zones.code`, §5.5). */
export type DeliveryZoneCode = "lome" | "maritime" | "plateaux" | "centrale" | "kara" | "savanes";

/**
 * Zone de livraison choisie dans le panier, colonne pour colonne comme `delivery_zones` (§5.5) :
 * frais en FCFA, seuil de gratuité (`null` : jamais gratuite) et délai affiché.
 */
export type DeliveryZoneOption = {
  code: DeliveryZoneCode;
  label: string;
  fee_fcfa: number;
  free_from_fcfa: number | null;
  eta_label: string;
};

const [lome, southRegions, northRegions] = deliveryZones as [
  DeliveryZone,
  DeliveryZone,
  DeliveryZone,
];

/**
 * Les six zones du panier (une par région, Lomé à part), dérivées des trois tarifs ci-dessus :
 * une valeur de D6 ne s'écrit qu'une fois. À l'étape 4, la table `delivery_zones` prend le relais.
 */
export const deliveryZoneOptions: readonly DeliveryZoneOption[] = [
  {
    code: "lome",
    label: lome.name,
    fee_fcfa: lome.feeFcfa,
    free_from_fcfa: freeDeliveryLomeFromFcfa,
    eta_label: lome.delay,
  },
  ...(
    [
      ["maritime", "Région Maritime", southRegions],
      ["plateaux", "Région des Plateaux", southRegions],
      ["centrale", "Région Centrale", northRegions],
      ["kara", "Région de la Kara", northRegions],
      ["savanes", "Région des Savanes", northRegions],
    ] as const
  ).map(([code, label, zone]) => ({
    code,
    label,
    fee_fcfa: zone.feeFcfa,
    free_from_fcfa: null,
    eta_label: zone.delay,
  })),
];
