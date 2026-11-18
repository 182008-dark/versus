/**
 * Formats acceptés pour un SKU et un code de zone, partagés par le stockage local (navigateur) et
 * le schéma zod du serveur. Mêmes motifs que la future RPC `quote_cart` (§5.8).
 */
export const SKU_PATTERN = /^[A-Z0-9-]{4,40}$/;
export const ZONE_CODE_PATTERN = /^[a-z]{2,20}$/;

export function isCartSku(value: unknown): value is string {
  return typeof value === "string" && SKU_PATTERN.test(value);
}

export function isZoneCode(value: unknown): value is string {
  return typeof value === "string" && ZONE_CODE_PATTERN.test(value);
}
