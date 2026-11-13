"use client";

import { useEffect } from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { ErrorState } from "@/components/layout/ErrorState";
import { Button } from "@/components/ui/Button";
import { routeFor } from "@/config/site";

/**
 * Erreur hors gabarit de groupe (gabarit (site) lui-même, /styleguide). Rendue dans le layout
 * racine, qui n'a aucun landmark : elle affiche le bandeau fictif et déclare son propre
 * <main id="contenu"> (§3.4 du plan).
 */
export default function RootError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const home = routeFor("accueil");

  return (
    <>
      <AnnouncementBar />
      <main id="contenu" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        <ErrorState
          code="Erreur"
          title="Une erreur est survenue"
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
      </main>
    </>
  );
}
