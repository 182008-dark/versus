"use client";

import { useId } from "react";
import { buttonClasses } from "@/components/ui/button-styles";
import { Dialog } from "@/components/ui/Dialog";

/**
 * Confirmation de « Vider le panier » (boîte modale). Chargée à la demande par ClearCartButton :
 * la page panier n'embarque pas `Dialog` tant qu'on ne vide rien (budget JavaScript).
 */
export function ClearCartDialog({
  open,
  count,
  onConfirm,
  onClose,
}: {
  open: boolean;
  /** Nombre d'articles (somme des quantités). */
  count: number;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const titleId = useId();
  return (
    <Dialog open={open} onClose={onClose} labelledBy={titleId}>
      <h2 id={titleId} className="font-display text-xl font-bold">
        Vider le panier ?
      </h2>
      <p className="mt-3 text-muted">
        {count > 1
          ? `Les ${count} articles seront retirés du panier.`
          : "L'article sera retiré du panier."}{" "}
        Cette action ne peut pas être annulée.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className={buttonClasses()} onClick={onConfirm}>
          Vider le panier
        </button>
        <button
          type="button"
          data-autofocus
          className={buttonClasses({ variant: "secondary" })}
          onClick={onClose}
        >
          Annuler
        </button>
      </div>
    </Dialog>
  );
}
