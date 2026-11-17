"use client";

import { useEffect } from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { ErrorActions } from "@/components/layout/ErrorActions";
import { ErrorState } from "@/components/layout/ErrorState";

/**
 * Erreur hors gabarit de groupe (gabarit (site) lui-même, /styleguide). Rendue dans le layout
 * racine, qui n'a aucun landmark : elle affiche le bandeau fictif et déclare son propre
 * <main id="contenu"> (§3.4 du plan). Imports réduits au minimum : voir ErrorActions.
 */
export default function RootError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <AnnouncementBar />
      <main id="contenu" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        <ErrorState
          code="Erreur"
          title="Une erreur est survenue"
          actions={<ErrorActions retry={retry} />}
        >
          <p>Un incident temporaire a empêché l&apos;affichage. Vous pouvez réessayer.</p>
        </ErrorState>
      </main>
    </>
  );
}
