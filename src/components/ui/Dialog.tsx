"use client";

import clsx from "clsx";
import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { getFocusableElements, trapTabKey } from "@/lib/a11y/focus-trap";

const variants = {
  /** Carte centrée (confirmation, choix). */
  modal:
    "m-auto w-[min(100%-32px,480px)] max-w-none rounded-box border-0 bg-bg p-8 text-ink shadow-tray",
  /** Plein écran (menu mobile). */
  fullscreen: "m-0 h-dvh max-h-none w-full max-w-none border-0 bg-bg p-0 text-ink",
} as const;

export type DialogProps = {
  open: boolean;
  /** Appelé pour toute demande de fermeture : Échap, bouton, clic hors de la carte. */
  onClose: () => void;
  /** Nom accessible : `labelledBy` (id d'un titre visible) ou, à défaut, `label`. */
  labelledBy?: string;
  label?: string;
  id?: string;
  variant?: keyof typeof variants;
  /** Élément qui reprend le focus à la fermeture (par défaut, celui qui l'avait à l'ouverture). */
  returnFocusRef?: RefObject<HTMLElement | null>;
  closeOnBackdrop?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Boîte de dialogue modale sur `<dialog>` natif (§4.3) :
 * - `showModal()` rend le reste de la page inerte et affiche `::backdrop` ;
 * - Échap ferme ; Tab et Maj+Tab bouclent dans la boîte (focus piégé) ;
 * - à l'ouverture, le focus va sur `[data-autofocus]` ou sur le premier élément focalisable ;
 * - à la fermeture, il revient à `returnFocusRef` ou à l'élément qui l'avait avant.
 * L'état est piloté par le parent (`open`, `onClose`).
 */
export function Dialog({
  open,
  onClose,
  labelledBy,
  label,
  id,
  variant = "modal",
  returnFocusRef,
  closeOnBackdrop = true,
  className,
  children,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      const active = document.activeElement;
      previousFocus.current = active instanceof HTMLElement ? active : null;
      dialog.showModal();
      const initial =
        dialog.querySelector<HTMLElement>("[data-autofocus]") ?? getFocusableElements(dialog)[0];
      initial?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      id={id}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      className={clsx(variants[variant], "open:flex open:flex-col", className)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
          return;
        }
        if (ref.current) trapTabKey(event, ref.current);
      }}
      onCancel={(event) => {
        // Échap natif (ou geste « retour ») : c'est le parent qui ferme.
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        (returnFocusRef?.current ?? previousFocus.current)?.focus();
        onClose();
      }}
      onClick={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
