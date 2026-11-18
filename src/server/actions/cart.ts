"use server";

import { cartQuoter } from "@/lib/cart/quoter";
import { QuoteError } from "@/lib/cart/compute-quote";
import type { PriceCartResult } from "@/lib/cart/quote";
import { quoteRequestSchema } from "@/lib/cart/schema";

/**
 * Recalcule le panier côté serveur (§5.8, ADR 003), selon le gabarit des Server Actions (§3.4) :
 * 1. `parse` zod : SKU, quantités et zone seulement (un prix envoyé fait refuser la requête) ;
 * 2. pas d'authentification : un devis est public et ne modifie rien ;
 * 3. calcul par `cartQuoter` (catalogue statique, puis RPC `quote_cart` à l'étape 4) ;
 * 4. aucune revalidation ;
 * 5. retour `{ ok: true, data }` ou `{ ok: false, code }`, sans détail interne.
 *
 * Les prix, le stock et les totaux affichés viennent toujours d'ici, jamais du navigateur.
 */
export async function priceCart(input: unknown): Promise<PriceCartResult> {
  const parsed = quoteRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "VS_INVALID" };

  try {
    const data = await cartQuoter.quote(parsed.data.lines, parsed.data.zone);
    return { ok: true, data };
  } catch (error) {
    if (error instanceof QuoteError) return { ok: false, code: error.code };
    console.error("priceCart : calcul du panier impossible", error);
    return { ok: false, code: "VS_UNAVAILABLE" };
  }
}
