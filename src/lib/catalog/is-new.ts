import type { CatalogProductRow } from "./types";

/**
 * Une nouveauté reste signalée jusqu'à la date `new_until` incluse (§4.5). `today` vient de
 * `getToday()` (fuseau Africa/Lome, injectable par VS_TODAY) ; une date mal formée ou un
 * `new_until` absent ne signalent rien.
 */
export function isNew(product: Pick<CatalogProductRow, "new_until">, today: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(today) && product.new_until !== null && product.new_until >= today
  );
}
