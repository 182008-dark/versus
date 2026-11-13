"use client";

import clsx from "clsx";
import { useEffect, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
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
  /**
   * Appelé une fois par demande de fermeture de l'utilisateur (Échap, geste « retour », clic
   * hors de la carte), ou si la boîte se ferme sans que le parent l'ait demandé. Jamais quand
   * c'est le parent qui passe `open` à `false`.
   */
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
 * - à la fermeture, il revient à `returnFocusRef` ou à l'élément qui l'avait avant ;
 * - quand le composant est démonté ou masqué par `<Activity>` (Next 16 garde la page quittée
 *   dans l'arbre, en `display: none`), la boîte est fermée : un `<dialog>` modal caché rendrait
 *   toute la page inerte.
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
  /** Dernière valeur de `open` vue par l'effet : distingue une fermeture demandée par le parent. */
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
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

  // Masquage par <Activity> ou démontage : les effets de mise en page sont nettoyés AVANT que
  // l'arbre soit caché. Une boîte restée ouverte est fermée (preserving-ui-state.md de Next).
  useLayoutEffect(() => {
    const dialog = ref.current;
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      id={id}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      className={clsx(variants[variant], "open:flex open:flex-col", className)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          // preventDefault() supprime aussi l'événement `cancel` : un seul appel à onClose.
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
        // Fermée sans que le parent l'ait demandé (masquage, démontage…) : on le prévient pour
        // que son état reste juste. Si c'est lui qui a fermé, `openRef` vaut déjà false.
        if (openRef.current) onClose();
      }}
      onClick={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
