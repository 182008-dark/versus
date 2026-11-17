"use client";

import { useEffect } from "react";
import { ErrorActions } from "@/components/layout/ErrorActions";
import { ErrorState } from "@/components/layout/ErrorState";

/**
 * Erreur d'une page publique. Rendue DANS le gabarit (site) : le bandeau, l'en-tête, le
 * <main id="contenu"> et le pied de page restent ceux du layout, on ne remplace que le contenu.
 * Aucune exception brute n'est affichée (§3.4). Imports réduits au minimum : voir ErrorActions.
 */
export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      code="Erreur"
      title="Cette page n'a pas pu s'afficher"
      actions={<ErrorActions retry={retry} />}
    >
      <p>Un incident temporaire a empêché l&apos;affichage. Vous pouvez réessayer.</p>
    </ErrorState>
  );
}
