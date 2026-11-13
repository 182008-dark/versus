"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { NavGroup } from "@/config/site";
import { Dialog } from "@/components/ui/Dialog";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { IconButton } from "@/components/ui/IconButton";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";

/** Le menu mobile n'existe que sous ce seuil (maquette : `.nav { display: none }` ≤ 900 px). */
const DESKTOP_QUERY = "(min-width: 901px)";

/**
 * Menu mobile (≤ 900 px), îlot client (§3.4). La maquette n'avait aucune navigation mobile :
 * c'est une correction UX (voir docs/ecarts-maquette.md).
 * - bouton « Menu » avec `aria-expanded` et `aria-controls` ;
 * - `<dialog>` plein écran : Échap ferme, focus piégé, focus rendu au bouton ;
 * - se ferme quand on suit un lien ou quand la fenêtre passe en mode bureau.
 */
export function MobileMenu({ groups }: { groups: NavGroup[] }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogId = useId();
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const query = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => {
      if (query.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [open]);

  if (groups.length === 0) return null;
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <IconButton
        ref={buttonRef}
        label="Menu"
        icon="menu"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      />
      <Dialog
        id={dialogId}
        open={open}
        onClose={close}
        labelledBy={titleId}
        variant="fullscreen"
        returnFocusRef={buttonRef}
        closeOnBackdrop={false}
      >
        <div className="wrap flex h-14 w-full shrink-0 items-center justify-between gap-5 border-b border-header-line">
          <Logo />
          <IconButton label="Fermer le menu" icon="close" data-autofocus onClick={close} />
        </div>
        <nav aria-labelledby={titleId} className="wrap w-full flex-1 overflow-y-auto py-8">
          <h2 id={titleId} className="sr-only">
            Menu
          </h2>
          {groups.map((group) => (
            <section key={group.label} className="mb-8">
              <Eyebrow as="h3">{group.label}</Eyebrow>
              <ul className="mt-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <NavLink
                      href={link.href}
                      onClick={close}
                      className="block py-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink aria-[current=page]:text-accent state-hover:text-accent"
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </Dialog>
    </div>
  );
}
