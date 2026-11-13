"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/layout/ErrorState";
import { Button } from "@/components/ui/Button";
import { routeFor } from "@/config/site";

/**
 * Erreur d'une page publique. Rendue DANS le gabarit (site) : le bandeau, l'en-tête, le
 * <main id="contenu"> et le pied de page restent ceux du layout, on ne remplace que le contenu.
 * Aucune exception brute n'est affichée (§3.4).
 */
export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const home = routeFor("accueil");

  return (
    <ErrorState
      code="Erreur"
      title="Cette page n'a pas pu s'afficher"
      actions={
        <>
          <Button variant="primary" size="lg" onClick={() => retry()}>
            Réessayer
          </Button>
          {home ? (
            <Button href={home} variant="outline" size="lg">
              Retour à l&apos;accueil
            </Button>
          ) : null}
        </>
      }
    >
      <p>Un incident temporaire a empêché l&apos;affichage. Vous pouvez réessayer.</p>
    </ErrorState>
  );
}
