import type { ReactNode } from "react";

/**
 * Contenu commun des pages d'erreur (404, erreur d'un segment, erreur globale) : surtitre,
 * titre de niveau 1, message, actions. Aucun détail technique n'est affiché (§3.4).
 * Le surtitre reprend le rendu d'`Eyebrow` sans l'importer (ni `clsx`) : ce composant part dans les
 * trois limites d'erreur chargées sur chaque page (budget JavaScript).
 */
export function ErrorState({
  code,
  title,
  children,
  actions,
}: {
  code: string;
  title: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div className="wrap flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center">
      <p className="flex items-center gap-2 eyebrow">
        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-accent" />
        {code}
      </p>
      <h1 className="max-w-2xl text-display-h2">{title}</h1>
      <div className="max-w-md text-[17px] leading-relaxed text-muted">{children}</div>
      <div className="flex flex-wrap items-center justify-center gap-3">{actions}</div>
    </div>
  );
}
