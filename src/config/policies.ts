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
