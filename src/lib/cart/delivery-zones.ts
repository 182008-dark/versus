import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { cartQuoter } from "./quoter";

/**
 * Zones de livraison du sélecteur de la page panier, lues côté serveur par l'interface unique
 * `CartQuoter.listZones()` (catalogue statique, puis table `delivery_zones` à l'étape 4, ADR 003).
 */
export async function getDeliveryZones() {
  "use cache";
  cacheLife("hours");
  cacheTag("delivery-zones");
  return cartQuoter.listZones();
}
