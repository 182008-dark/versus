import type { CatalogProduct } from "./types";

/** Une nouveauté reste signalée jusqu'à la date `new_until` incluse. */
export function isNew(product: Pick<CatalogProduct, "new_until">, today: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(today) && product.new_until >= today;
}
