import { useSyncExternalStore } from "react";
import { getCartSnapshot, subscribeCart, type CartSnapshot } from "./cart-store";

const serverSnapshot = () => null;

/**
 * Panier courant, ou `null` au rendu serveur et pendant l'hydratation (le stockage local n'est lu
 * qu'après) : le HTML serveur et le premier rendu client sont identiques, sans écart d'hydratation.
 */
export function useCart(): CartSnapshot | null {
  return useSyncExternalStore(subscribeCart, getCartSnapshot, serverSnapshot);
}
