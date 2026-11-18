"use client";

import { useId, type ReactNode, type RefObject } from "react";
import { Dialog } from "./Dialog";
import { Icon } from "./Icon";
import { iconButtonClasses } from "./icon-button-styles";

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  /** Titre visible, nom accessible du tiroir. */
  title: ReactNode;
  /** Élément qui reprend le focus à la fermeture (le bouton qui a ouvert le tiroir). */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** Titre focalisable (`tabIndex={-1}`) : cible du focus quand le contenu focalisé disparaît. */
  titleRef?: RefObject<HTMLHeadingElement | null>;
  /** Pied fixe (totaux, actions) ; le corps défile seul. */
  footer?: ReactNode;
  children: ReactNode;
};

/**
 * Tiroir latéral (§4.3, primitive de l'étape 5) : un `Dialog` modal collé au bord droit, de
 * 440 px au plus (pleine largeur sur téléphone). Mêmes garanties que `Dialog` : `<dialog>` natif,
 * Échap et clic sur le voile ferment, focus piégé puis rendu. Le bouton « Fermer » reçoit le
 * focus à l'ouverture ; le corps défile, l'en-tête et le pied restent visibles.
 */
export function Drawer({
  open,
  onClose,
  title,
  returnFocusRef,
  titleRef,
  footer,
  children,
}: DrawerProps) {
  const titleId = useId();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      variant="drawer"
      returnFocusRef={returnFocusRef}
    >
      <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-line-soft px-5">
        <h2
          ref={titleRef}
          id={titleId}
          tabIndex={-1}
          className="font-display text-lg font-bold tracking-[-0.02em]"
        >
          {title}
        </h2>
        <button
          type="button"
          aria-label="Fermer"
          data-autofocus
          className={iconButtonClasses}
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5">{children}</div>
      {footer ? <div className="shrink-0 border-t border-line-soft px-5 py-4">{footer}</div> : null}
    </Dialog>
  );
}
