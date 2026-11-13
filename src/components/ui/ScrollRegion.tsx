import clsx from "clsx";
import type { ReactNode } from "react";

/**
 * Conteneur à défilement horizontal (tableau large sur mobile), atteignable au clavier :
 * `tabIndex={0}` permet de le faire défiler avec les flèches (WCAG 2.1.1, règle axe
 * `scrollable-region-focusable`), `role="region"` et `label` le nomment pour les lecteurs
 * d'écran. Le nom reprend en général la légende du tableau.
 */
export function ScrollRegion({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={clsx("overflow-x-auto rounded-chip", className)}
    >
      {children}
    </div>
  );
}
