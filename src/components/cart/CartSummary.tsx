import clsx from "clsx";
import { Price } from "@/components/ui/Price";
import { articles } from "@/lib/cart/cart-messages";
import type { DeliveryZoneOption } from "@/config/policies";
import type { CartQuote } from "@/lib/cart/quote";
import { formatFCFA } from "@/lib/format/fcfa";

/**
 * Totaux du panier, tous lus dans le devis du serveur : sous-total, livraison (frais de la zone,
 * « Offerte » au-delà du seuil, ou « À choisir ») et total. Pendant un recalcul, l'ancien devis
 * reste affiché, atténué, avec `aria-busy`. Avec `zoneOption` (page panier), le montant restant
 * avant la livraison offerte est indiqué (Lomé, 300 000 FCFA).
 */
export function CartSummary({
  quote,
  count,
  pending,
  zoneLabel,
  zoneOption,
}: {
  quote: CartQuote | null;
  count: number;
  pending: boolean;
  /** Nom de la zone choisie (page panier) ; le tiroir n'affiche que le délai. */
  zoneLabel?: string;
  /** Zone choisie (seuil de gratuité), lue côté serveur par la page panier. */
  zoneOption?: DeliveryZoneOption;
}) {
  const missing =
    quote && zoneOption?.free_from_fcfa != null && quote.zone_code === zoneOption.code
      ? zoneOption.free_from_fcfa - quote.subtotal_fcfa
      : 0;
  const zone = quote?.zone_code ? (zoneLabel ?? quote.eta_label) : null;
  return (
    <div aria-busy={pending} data-testid="totaux">
      <dl className={clsx("space-y-2.5 transition-opacity", pending && "opacity-60")}>
        <div className="flex justify-between gap-4">
          <dt>Sous-total ({articles(count)})</dt>
          <dd data-testid="sous-total">{quote ? <Price amount={quote.subtotal_fcfa} /> : "…"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>
            Livraison
            {zone ? <span className="block text-sm text-muted">{zone}</span> : null}
          </dt>
          <dd data-testid="livraison" className="text-right">
            {!quote ? (
              "…"
            ) : !quote.zone_code ? (
              <span className="text-muted">Zone à choisir</span>
            ) : quote.delivery_fee_fcfa === 0 ? (
              <span className="font-semibold text-accent-ink">Offerte</span>
            ) : (
              <Price amount={quote.delivery_fee_fcfa} />
            )}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-line-soft pt-3">
          <dt className="font-semibold">{quote?.zone_code ? "Total" : "Total hors livraison"}</dt>
          <dd data-testid="total">
            {quote ? <Price amount={quote.total_fcfa} size="lead" /> : "…"}
          </dd>
        </div>
      </dl>
      {missing > 0 ? (
        <p className="mt-3 text-sm text-muted" data-testid="livraison-offerte">
          Plus que {formatFCFA(missing)} pour la livraison offerte.
        </p>
      ) : null}
      {pending ? <p className="mt-2 text-sm text-muted">Mise à jour des prix…</p> : null}
    </div>
  );
}
