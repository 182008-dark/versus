"use client";

import Link from "next/link";
import { Price } from "@/components/ui/Price";
import { maxQuantityPerLine } from "@/config/cart-limits";
import { issueMessage, lineName } from "@/lib/cart/cart-messages";
import type { CartLine } from "@/lib/cart/cart-reducer";
import type { CartLineMedia, CartQuoteLine } from "@/lib/cart/quote";
import type { Ref } from "react";
import { LineThumb } from "./LineThumb";
import { QuantityStepper } from "./QuantityStepper";

/**
 * Une ligne du panier : vignette, nom (lien vers la fiche), variante, prix unitaire, quantité,
 * « Retirer » et total de la ligne. La quantité vient du panier local ; le nom, les prix et le
 * stock viennent du devis du serveur (`info`), absent tant qu'il n'est pas arrivé. La ligne
 * (`tabIndex={-1}`) peut recevoir le focus quand la précédente est retirée (CartLines).
 */
export function CartLineItem({
  line,
  info,
  media,
  onQuantity,
  onRemove,
  ref,
}: {
  line: CartLine;
  info: CartQuoteLine | undefined;
  /** Fiche et vignette préparées par le serveur (`priceCart`). */
  media: CartLineMedia | undefined;
  onQuantity: (qty: number, max: number, name: string) => void;
  onRemove: (name: string) => void;
  ref?: Ref<HTMLLIElement>;
}) {
  const name = info ? lineName(info) : line.sku;
  const max = Math.min(maxQuantityPerLine, info?.stock ?? maxQuantityPerLine);
  const note = info ? issueMessage(info) : null;

  return (
    <li
      ref={ref}
      tabIndex={-1}
      aria-label={name}
      className="flex gap-4 py-5 focus-visible:outline-offset-4"
      data-sku={line.sku}
    >
      <LineThumb brand={info?.brand_slug} media={media} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="leading-snug font-semibold">
              {info && media?.href ? (
                <Link href={media.href} className="underline-offset-4 state-hover:underline">
                  {info.name}
                </Link>
              ) : (
                (info?.name ?? line.sku)
              )}
            </p>
            {info?.variant_label ? (
              <p className="mt-0.5 text-sm text-muted">{info.variant_label}</p>
            ) : null}
            {info?.price_fcfa != null ? (
              <p className="mt-0.5 text-sm text-muted">
                <Price amount={info.price_fcfa} /> l&apos;unité
              </p>
            ) : null}
          </div>
          <p className="shrink-0 text-right" data-testid="total-ligne">
            {info ? <Price amount={info.line_total_fcfa} /> : <span className="text-muted">…</span>}
          </p>
        </div>
        {note ? <p className="mt-2 text-sm text-warning">{note}</p> : null}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <QuantityStepper
            label={name}
            qty={line.qty}
            max={max}
            onChange={(qty) => onQuantity(qty, max, name)}
          />
          <button
            type="button"
            onClick={() => onRemove(name)}
            aria-label={`Retirer ${name} du panier`}
            className="min-h-11 px-1 text-sm font-semibold text-accent-ink underline underline-offset-4 state-hover:text-ink"
          >
            Retirer
          </button>
        </div>
      </div>
    </li>
  );
}
