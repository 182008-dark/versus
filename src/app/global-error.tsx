"use client";

import { useEffect } from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { ErrorState } from "@/components/layout/ErrorState";
import { Button } from "@/components/ui/Button";
import { SkipLink } from "@/components/ui/SkipLink";
import { fontVariables } from "./fonts";
import "./globals.css";

/**
 * Erreur du layout racine. Elle REMPLACE le layout racine : elle déclare donc <html lang="fr">,
 * <body>, les styles globaux, les polices, le lien d'évitement, le bandeau fictif et son propre
 * <main id="contenu">. Pas d'export `metadata` (composant client) : titre et noindex en balises.
 * Lien d'accueil en <a> : le routeur peut être indisponible ici.
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
            actions={
              <>
                <Button variant="primary" size="lg" onClick={() => retry()}>
                  Réessayer
                </Button>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- routeur indisponible */}
                <a
                  href="/"
                  className="inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4"
                >
                  Retour à l&apos;accueil
                </a>
              </>
            }
          >
            <p>Un incident temporaire a empêché l&apos;affichage. Vous pouvez réessayer.</p>
          </ErrorState>
        </main>
      </body>
    </html>
  );
}
