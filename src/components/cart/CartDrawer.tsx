"use client";

import { useRef, type RefObject } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { useCart } from "@/lib/cart/use-cart";
import { CartLines } from "./CartLines";
import { CartNotices } from "./CartNotices";
import { CartSummary } from "./CartSummary";
import { useCartQuote } from "./use-cart-quote";

export type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
  cartHref: string;
  shopHref: string | null;
};

/**
 * Mini-panier (PLAN §6, étape 5) : tiroir modal (`Drawer`, `<dialog>` natif, focus piégé puis
 * rendu à l'icône). Mêmes lignes, messages et totaux que la page panier ; les totaux ne
 * s'affichent que pour un panier non vide. Chargé à la demande par CartButton.
 */
export function CartDrawer({ open, onClose, returnFocusRef, cartHref, shopHref }: CartDrawerProps) {
  const cart = useCart();
  const state = useCartQuote(open ? cart : null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const empty = !cart || cart.lines.length === 0;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Votre panier"
      titleRef={titleRef}
      returnFocusRef={returnFocusRef}
      footer={
        empty ? undefined : (
          <div className="space-y-4">
            <CartSummary quote={state.quote} count={state.count} pending={state.pending} />
            <Button href={cartHref} onClick={onClose} size="lg" className="w-full">
              Voir le panier
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-3 pt-4 empty:hidden">
        <CartNotices notice={cart?.notice ?? null} state={state} />
      </div>
      {empty ? (
        <div className="py-8">
          <p className="text-lg">Votre panier est vide.</p>
          {shopHref ? (
            <Button href={shopHref} onClick={onClose} className="mt-6">
              Continuer mes achats
            </Button>
          ) : null}
        </div>
      ) : (
        <CartLines
          lines={cart.lines}
          quote={state.quote}
          media={state.media}
          fallbackFocus={titleRef}
          onUserChange={state.clearAdjustments}
        />
      )}
    </Drawer>
  );
}
