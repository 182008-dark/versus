import { maxQuantityPerLine } from "@/config/policies";

/**
 * Panier local (§6, étape 5) : seulement des SKU et des quantités. Aucun prix n'est conservé dans
 * le navigateur : le prix, le stock et les totaux viennent toujours du serveur (`priceCart`).
 */
export type CartLine = { sku: string; qty: number };

/** Nombre de lignes distinctes au plus (le serveur refuse au-delà). */
export const MAX_CART_LINES = 20;

export type CartAction =
  /** Ajoute `qty` (1 par défaut) ; `max` : stock connu de la variante. */
  | { type: "add"; sku: string; qty?: number; max?: number }
  /** Fixe la quantité (bornée de 1 au plafond) ; `max` à 0 retire la ligne (rupture). */
  | { type: "setQty"; sku: string; qty: number; max?: number }
  | { type: "remove"; sku: string }
  | { type: "clear" }
  /** Remplace tout (relecture du stockage, autre onglet). */
  | { type: "replace"; lines: readonly CartLine[] };

/** Plafond d'une ligne : la limite par ligne, ou le stock connu s'il est plus bas. */
function ceiling(max: number | undefined): number {
  return Math.max(0, Math.min(maxQuantityPerLine, max ?? maxQuantityPerLine));
}

function withQty(state: readonly CartLine[], sku: string, qty: number): CartLine[] {
  return state.map((line) => (line.sku === sku ? { sku, qty } : line));
}

/**
 * Réducteur pur du panier. Il renvoie le même tableau quand rien ne change, pour éviter une
 * écriture et un rendu inutiles.
 */
export function cartReducer(state: readonly CartLine[], action: CartAction): readonly CartLine[] {
  switch (action.type) {
    case "add": {
      const qty = action.qty ?? 1;
      const limit = ceiling(action.max);
      if (!Number.isInteger(qty) || qty < 1 || limit === 0) return state;
      const current = state.find((line) => line.sku === action.sku);
      if (!current) {
        if (state.length >= MAX_CART_LINES) return state;
        return [...state, { sku: action.sku, qty: Math.min(qty, limit) }];
      }
      const next = Math.min(current.qty + qty, limit);
      return next === current.qty ? state : withQty(state, action.sku, next);
    }
    case "setQty": {
      const current = state.find((line) => line.sku === action.sku);
      if (!current || !Number.isInteger(action.qty)) return state;
      const limit = ceiling(action.max);
      if (limit === 0) return state.filter((line) => line.sku !== action.sku);
      const next = Math.min(Math.max(action.qty, 1), limit);
      return next === current.qty ? state : withQty(state, action.sku, next);
    }
    case "remove":
      return state.some((line) => line.sku === action.sku)
        ? state.filter((line) => line.sku !== action.sku)
        : state;
    case "clear":
      return state.length === 0 ? state : [];
    case "replace":
      return action.lines;
  }
}

/** Nombre d'articles (somme des quantités), affiché dans l'en-tête. */
export function cartCount(lines: readonly CartLine[]): number {
  return lines.reduce((total, line) => total + line.qty, 0);
}
