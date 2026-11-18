"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import type { DeliveryZoneOption } from "@/config/policies";
import { setCartZone } from "@/lib/cart/cart-store";
import { useCart } from "@/lib/cart/use-cart";
import { CartLines } from "./CartLines";
import { CartNotices } from "./CartNotices";
import { CartSummary } from "./CartSummary";
import { ClearCartButton } from "./ClearCartButton";
import { useCartQuote } from "./use-cart-quote";

/**
 * Contenu de la page `/panier` (PLAN §6, étape 5), îlot client : lignes (quantités, retrait),
 * « Vider le panier », zone de livraison (zones lues par le serveur via `CartQuoter.listZones()`),
 * totaux recalculés par le serveur, messages d'écart, état vide. Aucune commande ni paiement :
 * sans route « commande » livrée, « La commande simulée arrive bientôt » remplace le bouton.
 * N'importe ni le tiroir ni `Dialog` (budget JavaScript ; la confirmation est chargée au clic).
 */
export function CartPage({
  zones,
  shopHref,
  orderHref,
}: {
  zones: readonly DeliveryZoneOption[];
  shopHref: string | null;
  orderHref: string | null;
}) {
  const cart = useCart();
  const state = useCartQuote(cart);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const focusTitle = () => titleRef.current?.focus();

  const title = (
    <h1 ref={titleRef} tabIndex={-1} className="text-display-h2">
      Votre panier
    </h1>
  );
  if (!cart) {
    return (
      <div className="wrap section">
        {title}
        <p className="mt-4 text-muted">Chargement du panier…</p>
      </div>
    );
  }

  const zone = zones.find((item) => item.code === cart.zone);
  const notices = (
    <CartNotices
      notice={cart.notice}
      state={state}
      action={
        state.error === "VS_UNAVAILABLE" ? (
          <button type="button" className="font-semibold underline" onClick={state.retry}>
            Réessayer
          </button>
        ) : state.error === "VS_INVALID" ? (
          <ClearCartButton count={cart.count} onCleared={focusTitle} />
        ) : null
      }
    />
  );

  return (
    <div className="wrap section">
      {title}
      <div className="mt-4 space-y-3">{notices}</div>
      {cart.lines.length === 0 ? (
        <div className="mt-8">
          <p className="text-lg">Votre panier est vide.</p>
          <p className="mt-2 text-muted">
            Les prix sont indicatifs et aucune vente réelle n’est effectuée.
          </p>
          {shopHref ? (
            <Button href={shopHref} className="mt-6">
              Continuer mes achats
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section aria-label="Articles du panier">
            <CartLines
              lines={cart.lines}
              quote={state.quote}
              media={state.media}
              fallbackFocus={titleRef}
              onUserChange={state.clearAdjustments}
            />
            <div className="mt-2 flex justify-end">
              <ClearCartButton count={cart.count} onCleared={focusTitle} />
            </div>
            <label className="mt-6 block max-w-md text-sm font-semibold">
              Zone de livraison
              <select
                value={cart.zone ?? ""}
                onChange={(event) => {
                  state.clearAdjustments();
                  setCartZone(event.target.value || null);
                }}
                className="mt-2 min-h-12 w-full rounded-control border border-line-control bg-bg px-3 font-normal"
              >
                <option value="">Choisir une zone</option>
                {zones.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </section>
          <aside
            aria-labelledby="recapitulatif-titre"
            className="h-fit rounded-card border border-line-soft p-6"
          >
            <h2 id="recapitulatif-titre" className="mb-5 text-lg font-bold">
              Récapitulatif
            </h2>
            <CartSummary
              quote={state.quote}
              count={state.count}
              pending={state.pending}
              zoneLabel={zone?.label}
              zoneOption={zone}
            />
            {orderHref ? (
              <Button href={orderHref} className="mt-6 w-full">
                Commander
              </Button>
            ) : (
              <p className="mt-6 rounded-control bg-surface p-3 text-sm font-semibold">
                La commande simulée arrive bientôt.
              </p>
            )}
            <p className="mt-4 text-xs text-muted">
              Projet pédagogique : prix indicatifs, aucune commande ni paiement réel.
            </p>
            {shopHref ? (
              <Button href={shopHref} variant="secondary" className="mt-5 w-full">
                Continuer mes achats
              </Button>
            ) : null}
          </aside>
        </div>
      )}
    </div>
  );
}
