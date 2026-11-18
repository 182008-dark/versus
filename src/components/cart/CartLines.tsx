"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { updateCart } from "@/lib/cart/cart-store";
import type { CartLine } from "@/lib/cart/cart-reducer";
import type { CartLineMedia, CartQuote } from "@/lib/cart/quote";
import { CartLineItem } from "./CartLineItem";

/**
 * Lignes du panier, partagées par la page `/panier` et le tiroir :
 * - chaque changement (quantité, retrait) est annoncé dans une région `status` montée vide ;
 * - après « Retirer », le focus passe à la ligne suivante (ou à la précédente), sinon au titre
 *   (`fallbackFocus`) : il ne tombe jamais sur `<body>`, ce qui le ferait sortir du tiroir modal ;
 * - `onUserChange` prévient le parent (effacer les corrections affichées).
 */
export function CartLines({
  lines,
  quote,
  media,
  fallbackFocus,
  onUserChange,
}: {
  lines: readonly CartLine[];
  quote: CartQuote | null;
  media: Readonly<Record<string, CartLineMedia>>;
  fallbackFocus: RefObject<HTMLElement | null>;
  onUserChange?: () => void;
}) {
  const [announcement, setAnnouncement] = useState("");
  const items = useRef(new Map<string, HTMLLIElement>());
  /** Ligne à focaliser après un retrait. */
  const focusNext = useRef<string | undefined>(undefined);
  const info = new Map(quote?.lines.map((line) => [line.sku, line]));

  useEffect(() => {
    if (focusNext.current === undefined) return;
    const target = items.current.get(focusNext.current);
    focusNext.current = undefined;
    (target ?? fallbackFocus.current)?.focus();
  }, [lines, fallbackFocus]);

  function remove(index: number, name: string) {
    const line = lines[index]!;
    const next = (lines[index + 1] ?? lines[index - 1])?.sku;
    if (next) focusNext.current = next;
    // Dernière ligne : la liste va disparaître (état vide) et son effet ne s'exécutera pas ; le
    // titre, lui, reste. Le focus y passe avant le retrait, jamais sur `<body>`.
    else fallbackFocus.current?.focus();
    updateCart({ type: "remove", sku: line.sku });
    setAnnouncement(`${name} retiré du panier.`);
    onUserChange?.();
  }

  return (
    <>
      <ul className="divide-y divide-line-soft">
        {lines.map((line, index) => (
          <CartLineItem
            key={line.sku}
            ref={(element) => {
              if (element) items.current.set(line.sku, element);
              else items.current.delete(line.sku);
            }}
            line={line}
            info={info.get(line.sku)}
            media={media[line.sku]}
            onQuantity={(qty, max, name) => {
              updateCart({ type: "setQty", sku: line.sku, qty, max });
              setAnnouncement(`Quantité de ${name} : ${Math.min(qty, max)}.`);
              onUserChange?.();
            }}
            onRemove={(name) => remove(index, name)}
          />
        ))}
      </ul>
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
