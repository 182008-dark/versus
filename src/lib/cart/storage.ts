import { maxQuantityPerLine } from "@/config/policies";
import { MAX_CART_LINES, type CartLine } from "./cart-reducer";
import { isCartSku, isZoneCode } from "./sku";

/**
 * Persistance locale du panier (`localStorage`), versionnée et défensive : tout ce qui est relu
 * peut avoir été modifié à la main. On ne garde que des SKU et des quantités valides ; un prix,
 * un nom ou toute autre clé sont ignorés (le serveur fait foi, §5.8).
 *
 * Validation écrite à la main plutôt qu'avec zod : ce module part dans le JavaScript de chaque
 * page, sous le budget de 150 Ko (ADR 003). zod valide les entrées côté serveur (`schema.ts`).
 */

export const CART_STORAGE_KEY = "versus.cart.v1";
export const CART_STORAGE_VERSION = 1;

export type StoredCart = { lines: readonly CartLine[]; zone: string | null };

/**
 * - `empty` : rien d'enregistré ; `ok` : relu tel quel ;
 * - `repaired` : des lignes invalides ont été retirées ou corrigées ;
 * - `reset` : données illisibles ou d'une autre version, panier vidé.
 */
export type ReadStatus = "empty" | "ok" | "repaired" | "reset";

/** `quota` : stockage plein ; `unavailable` : stockage bloqué ou absent. */
export type WriteError = "quota" | "unavailable";

const RESET = { lines: [], zone: null, status: "reset" } as const;

/** Lit la valeur brute de `localStorage` et en tire un panier sûr. */
export function parseStoredCart(raw: string | null): StoredCart & { status: ReadStatus } {
  if (raw === null) return { lines: [], zone: null, status: "empty" };
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return RESET;
  }
  if (typeof data !== "object" || data === null) return RESET;
  const { version, lines, zone } = data as Record<string, unknown>;
  if (version !== CART_STORAGE_VERSION || !Array.isArray(lines)) return RESET;

  let repaired = false;
  const merged = new Map<string, number>();
  for (const item of lines as unknown[]) {
    const { sku, qty } = (typeof item === "object" && item !== null ? item : {}) as Record<
      string,
      unknown
    >;
    if (!isCartSku(sku) || !Number.isInteger(qty) || (qty as number) < 1) {
      repaired = true;
      continue;
    }
    const total = (merged.get(sku) ?? 0) + (qty as number);
    if (merged.has(sku) || total > maxQuantityPerLine) repaired = true;
    if (!merged.has(sku) && merged.size >= MAX_CART_LINES) {
      repaired = true;
      continue;
    }
    merged.set(sku, Math.min(total, maxQuantityPerLine));
  }

  const validZone = zone === null || zone === undefined || isZoneCode(zone);
  return {
    lines: Array.from(merged, ([sku, qty]) => ({ sku, qty })),
    zone: validZone ? ((zone as string | null | undefined) ?? null) : null,
    status: repaired || !validZone ? "repaired" : "ok",
  };
}

/** Charge enregistrée : version, lignes (SKU et quantité seulement) et zone choisie. */
export function serializeCart({ lines, zone }: StoredCart): string {
  return JSON.stringify({
    version: CART_STORAGE_VERSION,
    lines: lines.map(({ sku, qty }) => ({ sku, qty })),
    zone,
  });
}

/** Écrit le panier ; renvoie la raison d'un échec plutôt que de lever une exception. */
export function writeStoredCart(
  storage: Pick<Storage, "setItem"> | undefined,
  cart: StoredCart,
): WriteError | null {
  if (!storage) return "unavailable";
  try {
    storage.setItem(CART_STORAGE_KEY, serializeCart(cart));
    return null;
  } catch (error) {
    return error instanceof DOMException && /quota/i.test(error.name) ? "quota" : "unavailable";
  }
}
