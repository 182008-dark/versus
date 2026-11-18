"use client";

import type { ReactNode } from "react";
import { noticeMessage, quoteErrorMessage } from "@/lib/cart/cart-messages";
import type { CartNotice } from "@/lib/cart/cart-store";
import type { CartQuoteState } from "./use-cart-quote";

/**
 * Messages du panier, partagés par la page et le tiroir : avertissement du stockage local
 * (`noticeMessage`), corrections imposées par le serveur, erreur du calcul
 * (`quoteErrorMessage`). Les régions sont montées vides, puis remplies : un lecteur d'écran
 * annonce ce qui y apparaît. `action` : bouton adapté à l'erreur (Réessayer, Vider le panier).
 */
export function CartNotices({
  notice,
  state,
  action,
}: {
  notice: CartNotice | null;
  state: Pick<CartQuoteState, "adjustments" | "error">;
  action?: ReactNode;
}) {
  const messages = [...(notice ? [noticeMessage(notice)] : []), ...state.adjustments];
  return (
    <>
      <div role="status" className="space-y-2 empty:hidden">
        {messages.map((message, index) => (
          <p key={index} className="rounded-control bg-surface p-3 text-sm">
            {message}
          </p>
        ))}
      </div>
      <div role="alert" className="empty:hidden">
        {state.error ? (
          <p className="rounded-control bg-surface p-3 text-sm text-warning">
            {quoteErrorMessage(state.error)} {action}
          </p>
        ) : null}
      </div>
    </>
  );
}
