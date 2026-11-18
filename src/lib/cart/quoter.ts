import "server-only";
import type { CartQuoter } from "./quote";
import { staticCartQuoter } from "./static-quoter";

/**
 * Seul point de bascule du calcul du panier (ADR 003). À l'étape 4 :
 * `export const cartQuoter: CartQuoter = supabaseCartQuoter;` (RPC `quote_cart` et table
 * `delivery_zones`), sans changer la Server Action ni les composants.
 */
export const cartQuoter: CartQuoter = staticCartQuoter;
