"use client";

import Link from "next/link";
import { useState } from "react";
import { addOutcome, type AddStatus } from "@/lib/cart/add-outcome";
import { getCartSnapshot, updateCart } from "@/lib/cart/cart-store";

/**
 * Bouton « Ajouter au panier » de la fiche (PLAN §6, étape 5) : ajoute la variante choisie sans
 * quitter la fiche, plafonnée à son stock (`max`) et à la limite par ligne. Le résultat réel est
 * annoncé dans une région `role="status"` montée vide (« … ajouté au panier », « Quantité
 * maximale atteinte », « Panier plein ») ; après un ajout, un lien mène au panier.
 * Variante épuisée : `aria-disabled` (le bouton reste atteignable au clavier) et « Épuisé ».
 * Le nom accessible commence par le texte visible et nomme la variante (WCAG 2.5.3). Les classes
 * du bouton arrivent du serveur (`buttonClasses`), qui garde `button-styles.ts` hors de l'îlot.
 */
export function AddToCartButton({
  sku,
  name,
  stock,
  cartHref,
  className,
}: {
  sku: string;
  /** « iPhone 18 Pro (Bordeaux · 512 Go) » */
  name: string;
  stock: number;
  cartHref: string | null;
  className: string;
}) {
  // Le résultat est celui d'une variante : il s'efface quand la variante change (sans remonter
  // le composant, pour garder la région d'annonce en place).
  const [last, setLast] = useState<{ sku: string; status: AddStatus; message: string } | null>(
    null,
  );
  const result = last?.sku === sku ? last : null;
  const soldOut = stock <= 0;

  function add() {
    if (soldOut) return;
    const before = getCartSnapshot().lines;
    const after = updateCart({ type: "add", sku, max: stock }).lines;
    setLast({ sku, ...addOutcome(before, after, sku, name, stock) });
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        aria-disabled={soldOut ? true : undefined}
        onClick={add}
        className={className}
      >
        {soldOut ? "Épuisé" : "Ajouter au panier"}
        <span className="sr-only">{` : ${name}`}</span>
      </button>
      <p role="status" className="mt-3 min-h-6 text-sm">
        {result?.message}
        {result?.status === "added" && cartHref ? (
          <>
            {" "}
            <Link
              href={cartHref}
              className="font-semibold text-accent-ink underline underline-offset-4"
            >
              Voir le panier
            </Link>
          </>
        ) : null}
      </p>
    </div>
  );
}
