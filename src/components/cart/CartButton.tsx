"use client";

import { usePathname } from "next/navigation";
import { useRef, useState, type ComponentType, type ReactNode } from "react";
import { CountBadge } from "@/components/ui/CountBadge";
import { countLabel } from "@/components/ui/count-label";
import { iconButtonClasses } from "@/components/ui/icon-button-styles";
import { useCart } from "@/lib/cart/use-cart";
import type { CartDrawerProps } from "./CartDrawer";

/** Le tiroir n'est téléchargé qu'à la première ouverture (ou au survol) : budget JavaScript. */
const loadDrawer = () => import("./CartDrawer").then((module) => module.CartDrawer);

/**
 * Icône « Panier » de l'en-tête (§4.3 : IconButton + CountBadge) et mini-panier.
 * - Rendu serveur et hydratation : un lien vers `/panier`, sans compteur (le stockage local n'est
 *   lu qu'après l'hydratation, donc aucun écart).
 * - Ensuite : un bouton « Panier, 3 articles » (`countLabel`, `aria-haspopup="dialog"`) qui ouvre
 *   le tiroir ; le compteur est annoncé poliment et la pastille (CountBadge, « 99+ » au-delà)
 *   rejoue `bump` à chaque changement (`key`).
 * - Sur la page panier, pas de tiroir (deux devis concurrents) : l'icône reste un lien vers
 *   `/panier` marqué `aria-current="page"`, avec son compteur, sans `aria-haspopup` ni
 *   `aria-expanded` (le rôle annoncé correspond à l'action, WCAG 4.1.2).
 * L'icône est rendue par le serveur et reçue en props (pas de tracés SVG dans le JavaScript).
 */
export function CartButton({
  href,
  shopHref,
  icon,
}: {
  href: string;
  shopHref: string | null;
  icon: ReactNode;
}) {
  const cart = useCart();
  const onCartPage = usePathname() === href;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [Drawer, setDrawer] = useState<ComponentType<CartDrawerProps> | null>(null);
  const [open, setOpen] = useState(false);

  if (!cart) {
    return (
      <a href={href} aria-label="Panier" className={iconButtonClasses}>
        {icon}
      </a>
    );
  }

  const name = countLabel("Panier", cart.count);
  const badge = cart.count > 0 ? <CountBadge key={cart.count} value={cart.count} /> : null;
  const live = (
    <span className="sr-only" aria-live="polite">
      {name}
    </span>
  );

  if (onCartPage) {
    return (
      <>
        <a href={href} aria-label={name} aria-current="page" className={iconButtonClasses}>
          {icon}
          {badge}
        </a>
        {live}
      </>
    );
  }

  const openDrawer = () => {
    loadDrawer().then(
      (component) => {
        setDrawer(() => component);
        setOpen(true);
      },
      // Hors ligne ou morceau introuvable : la page panier fait l'affaire.
      () => window.location.assign(href),
    );
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={name}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={iconButtonClasses}
        onClick={openDrawer}
        onPointerEnter={loadDrawer}
        onFocus={loadDrawer}
      >
        {icon}
        {badge}
      </button>
      {live}
      {Drawer ? (
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          returnFocusRef={buttonRef}
          cartHref={href}
          shopHref={shopHref}
        />
      ) : null}
    </>
  );
}
