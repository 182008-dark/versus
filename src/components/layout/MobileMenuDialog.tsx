"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { iconButtonClasses } from "@/components/ui/icon-button-styles";

/** Le menu mobile n'existe que sous ce seuil (maquette : `.nav { display: none }` ≤ 900 px). */
const DESKTOP_QUERY = "(min-width: 901px)";

/**
 * Îlot client du menu mobile : l'état ouvert/fermé et la boîte de dialogue. Le contenu (logo,
 * liens, icônes) est rendu par le serveur et reçu en props : il n'alourdit pas le JavaScript.
 * - bouton « Menu » avec `aria-expanded` et `aria-controls` ;
 * - `<dialog>` plein écran : Échap ferme, focus piégé, focus rendu au bouton ;
 * - se ferme quand on suit un lien (délégation de clic : logo compris), quand le chemin change
 *   (retour arrière…), quand la fenêtre passe en mode bureau, et quand `<Activity>` masque la
 *   page quittée (Next 16, cacheComponents) : sinon un `<dialog>` modal resterait ouvert dans
 *   l'arbre caché et rendrait la nouvelle page inerte.
 */
export function MobileMenuDialog({
  menuIcon,
  closeIcon,
  logo,
  children,
}: {
  menuIcon: ReactNode;
  closeIcon: ReactNode;
  logo: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState(pathname);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogId = useId();
  const titleId = useId();

  // Changement de chemin : on ferme pendant le rendu (ajustement d'état recommandé par React).
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  // Page masquée par <Activity> : le nettoyage s'exécute avant le masquage (preserving-ui-state.md).
  useLayoutEffect(() => () => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const query = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => {
      if (query.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-haspopup="dialog"
        className={iconButtonClasses}
        onClick={() => setOpen(true)}
      >
        {menuIcon}
      </button>
      <Dialog
        id={dialogId}
        open={open}
        onClose={close}
        labelledBy={titleId}
        variant="fullscreen"
        returnFocusRef={buttonRef}
        closeOnBackdrop={false}
      >
        {/* Suivre un lien du menu (logo compris) le ferme. */}
        <div
          className="flex min-h-0 flex-1 flex-col"
          onClick={(event) => {
            if (event.target instanceof Element && event.target.closest("a")) close();
          }}
        >
          <div className="wrap flex h-14 w-full shrink-0 items-center justify-between gap-5 border-b border-header-line">
            {logo}
            <button
              type="button"
              aria-label="Fermer le menu"
              data-autofocus
              className={iconButtonClasses}
              onClick={close}
            >
              {closeIcon}
            </button>
          </div>
          <nav aria-labelledby={titleId} className="wrap w-full flex-1 overflow-y-auto py-8">
            <h2 id={titleId} className="sr-only">
              Menu
            </h2>
            {children}
          </nav>
        </div>
      </Dialog>
    </div>
  );
}
