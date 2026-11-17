"use client";

import { useEffect } from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { ErrorActions } from "@/components/layout/ErrorActions";
import { ErrorState } from "@/components/layout/ErrorState";
import { SkipLink } from "@/components/ui/SkipLink";
import { fontVariables } from "./fonts";
import "./globals.css";

/**
 * Erreur du layout racine. Elle REMPLACE le layout racine : elle déclare donc <html lang="fr">,
 * <body>, les styles globaux, les polices, le lien d'évitement, le bandeau fictif et son propre
 * <main id="contenu">. Pas d'export `metadata` (composant client) : titre et noindex en balises.
 * Imports réduits au minimum (budget JavaScript) : voir ErrorActions.
 */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <title>Erreur | VERSUS</title>
        <meta name="robots" content="noindex, nofollow" />
        <SkipLink />
        <AnnouncementBar />
        <main id="contenu" tabIndex={-1} className="flex flex-1 flex-col outline-none">
          <ErrorState
            code="Erreur"
            title="Le site n'a pas pu s'afficher"
            actions={<ErrorActions retry={retry} />}
          >
            <p>Un incident temporaire a empêché l&apos;affichage. Vous pouvez réessayer.</p>
          </ErrorState>
        </main>
      </body>
    </html>
  );
}
