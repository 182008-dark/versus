import { cartCount, cartReducer, type CartAction, type CartLine } from "./cart-reducer";
import { CART_STORAGE_KEY, parseStoredCart, writeStoredCart, type WriteError } from "./storage";

/**
 * Magasin du panier côté navigateur, lu par `useSyncExternalStore` (`use-cart.ts`). Un module
 * plutôt qu'un contexte React : aucun fournisseur à placer autour du site, et seuls les îlots qui
 * lisent le panier (icône de l'en-tête, bouton d'ajout, page panier) le chargent (ADR 003).
 *
 * Le panier n'est lu qu'au premier accès dans le navigateur, jamais pendant le rendu serveur :
 * `use-cart.ts` renvoie `null` au serveur et pendant l'hydratation, donc aucun écart d'hydratation.
 */

/**
 * Avertissement à afficher : données réparées (`repaired`) ou vidées (`reset`) à la lecture,
 * stockage plein (`quota`) ou indisponible (`unavailable`) à l'écriture.
 */
export type CartNotice = "repaired" | "reset" | WriteError;

export type CartSnapshot = {
  lines: readonly CartLine[];
  zone: string | null;
  /** Nombre d'articles (somme des quantités). */
  count: number;
  notice: CartNotice | null;
};

let snapshot: CartSnapshot | undefined;
const listeners = new Set<() => void>();

function storage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function make(lines: readonly CartLine[], zone: string | null, notice: CartNotice | null) {
  return { lines, zone, count: cartCount(lines), notice };
}

/** Relit le stockage ; des données réparées ou illisibles sont réécrites saines. */
function load(): CartSnapshot {
  const store = storage();
  let raw: string | null = null;
  try {
    raw = store?.getItem(CART_STORAGE_KEY) ?? null;
  } catch {
    return make([], null, "unavailable");
  }
  const { lines, zone, status } = parseStoredCart(raw);
  if (status === "repaired" || status === "reset") {
    writeStoredCart(store, { lines, zone });
    return make(lines, zone, status);
  }
  return make(lines, zone, store ? null : "unavailable");
}

function emit() {
  for (const listener of listeners) listener();
}

/** Un autre onglet a modifié le panier : on relit le stockage. */
function onStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== CART_STORAGE_KEY) return;
  snapshot = load();
  emit();
}

export function getCartSnapshot(): CartSnapshot {
  if (!snapshot) {
    snapshot = load();
    window.addEventListener("storage", onStorage);
  }
  return snapshot;
}

export function subscribeCart(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function commit(lines: readonly CartLine[], zone: string | null): CartSnapshot {
  const current = getCartSnapshot();
  if (lines === current.lines && zone === current.zone) return current;
  snapshot = make(lines, zone, writeStoredCart(storage(), { lines, zone }));
  emit();
  return snapshot;
}

/** Applique une action du réducteur, enregistre et prévient les îlots abonnés. */
export function updateCart(action: CartAction): CartSnapshot {
  const current = getCartSnapshot();
  return commit(cartReducer(current.lines, action), current.zone);
}

/** Zone de livraison choisie sur la page panier (code de `delivery_zones`, ou `null`). */
export function setCartZone(zone: string | null): CartSnapshot {
  return commit(getCartSnapshot().lines, zone);
}
