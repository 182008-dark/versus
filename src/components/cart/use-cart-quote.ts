import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { quoteCorrections } from "@/lib/cart/cart-messages";
import { updateCart, type CartSnapshot } from "@/lib/cart/cart-store";
import type { CartLineMedia, CartQuote, PriceCartResult } from "@/lib/cart/quote";
import { priceCart } from "@/server/actions/cart";

/** Délai de regroupement des clics rapprochés (« + + + ») avant de demander un devis. */
export const QUOTE_DEBOUNCE_MS = 250;

const NO_MEDIA: Readonly<Record<string, CartLineMedia>> = {};

type QuoteErrorCode = Extract<PriceCartResult, { ok: false }>["code"];
type Received = { key: string; attempt: number; result: PriceCartResult };

export type CartQuoteState = {
  /**
   * Devis à afficher : celui des lignes et de la zone courantes, ou, pendant un recalcul, le
   * précédent (atténué, voir `pending`). Toujours `null` pour un panier vide.
   */
  quote: CartQuote | null;
  /** Fiche et vignette de chaque ligne du devis affiché, par SKU. */
  media: Readonly<Record<string, CartLineMedia>>;
  /** Un devis plus récent est attendu. */
  pending: boolean;
  error: QuoteErrorCode | null;
  /** Nombre d'articles : celui du devis à jour, sinon celui du panier local. */
  count: number;
  /** Corrections imposées par le serveur (ligne retirée, quantité ramenée au stock). */
  adjustments: string[];
  /** Efface les corrections : à appeler au prochain changement fait par le visiteur. */
  clearAdjustments: () => void;
  retry: () => void;
};

/**
 * Devis du panier demandé au serveur (Server Action `priceCart`) quand les lignes ou la zone
 * changent. Le navigateur n'envoie que les SKU, les quantités et la zone ; tout montant affiché
 * vient de la réponse (le serveur fait foi, §5.8).
 * - les changements rapprochés sont regroupés (`QUOTE_DEBOUNCE_MS`), le premier devis part tout
 *   de suite ; une réponse arrivée après une modification plus récente est ignorée ;
 * - un devis ne sert que pour les lignes et la zone qui l'ont demandé : un panier vidé n'affiche
 *   jamais d'anciens totaux ;
 * - une variante indisponible ou un stock insuffisant corrigent le panier local, et la correction
 *   est expliquée (`adjustments`).
 */
export function useCartQuote(cart: CartSnapshot | null): CartQuoteState {
  const [received, setReceived] = useState<Received | null>(null);
  const [adjustments, setAdjustments] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);
  const quoted = useRef(false);
  const key = cart && cart.lines.length > 0 ? JSON.stringify([cart.lines, cart.zone]) : "";

  useEffect(() => {
    if (!key) return;
    const [lines, zone] = JSON.parse(key) as [CartSnapshot["lines"], string | null];
    let current = true;
    const timer = window.setTimeout(
      async () => {
        let result: PriceCartResult;
        try {
          result = await priceCart({ lines, zone });
        } catch {
          result = { ok: false, code: "VS_UNAVAILABLE" };
        }
        if (!current) return;
        quoted.current = true;
        // Après un `await`, les mises à jour doivent être de nouveau enveloppées (React 19).
        startTransition(() => {
          if (result.ok) {
            const { actions, messages } = quoteCorrections(result.data);
            if (messages.length > 0) setAdjustments(messages);
            for (const action of actions) updateCart(action);
          }
          setReceived({ key, attempt, result });
        });
      },
      quoted.current ? QUOTE_DEBOUNCE_MS : 0,
    );
    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [key, attempt]);

  const clearAdjustments = useCallback(() => setAdjustments([]), []);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  const fresh = received && received.key === key ? received.result : null;
  const previous = received?.result.ok ? received.result : null;
  const shown = !key ? null : fresh ? (fresh.ok ? fresh : null) : previous;
  const upToDate = fresh?.ok && received?.attempt === attempt;
  return {
    quote: shown?.data ?? null,
    media: shown?.media ?? NO_MEDIA,
    pending: Boolean(key) && (received?.key !== key || received.attempt !== attempt),
    error: fresh && !fresh.ok && received?.attempt === attempt ? fresh.code : null,
    count: upToDate
      ? fresh.data.lines.reduce((total, line) => total + line.qty, 0)
      : (cart?.count ?? 0),
    adjustments,
    clearAdjustments,
    retry,
  };
}
