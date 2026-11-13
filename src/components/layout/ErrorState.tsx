import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * Contenu commun des pages d'erreur (404, erreur d'un segment, erreur globale) : surtitre,
 * titre de niveau 1, message, actions. Aucun détail technique n'est affiché (§3.4).
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
      <Eyebrow>{code}</Eyebrow>
      <h1 className="max-w-2xl text-display-h2">{title}</h1>
      <div className="max-w-md text-[17px] leading-relaxed text-muted">{children}</div>
      <div className="flex flex-wrap items-center justify-center gap-3">{actions}</div>
    </div>
  );
}
