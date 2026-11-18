import "server-only";
import { deliveryZoneOptions } from "@/config/policies";
import { products } from "@/data/catalog";
import { computeQuote, quoteSourceFromCatalog } from "./compute-quote";
import type { CartQuoter } from "./quote";

const source = quoteSourceFromCatalog(products, deliveryZoneOptions);

/**
 * Devis calculé sur le catalogue statique (étapes 3 à 5, ADR 003). Pas de `"use cache"` : un
 * devis dépend du stock, qui doit toujours être lu au moment de la demande (à l'étape 4, la RPC
 * `quote_cart` est appelée sans cache par le client public).
 */
export const staticCartQuoter: CartQuoter = {
  async quote(items, zoneCode) {
    return computeQuote(items, zoneCode, source);
  },
  async listZones() {
    return deliveryZoneOptions;
  },
};
