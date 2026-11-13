import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { ErrorState } from "@/components/layout/ErrorState";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/Button";
import { routeFor } from "@/config/site";

export const metadata: Metadata = {
  title: "Page introuvable",
};

/**
 * Page 404, hors gabarit de groupe : elle recompose le gabarit public (bandeau fictif,
 * en-tête, son propre <main id="contenu">, pied de page) (§3.4 du plan).
 */
export default function NotFound() {
  const home = routeFor("accueil");
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main id="contenu" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        <ErrorState
          code="Erreur 404"
          title="Page introuvable"
          actions={
            home ? (
              <Button href={home} variant="primary" size="lg">
                Retour à l&apos;accueil
              </Button>
            ) : null
          }
        >
          <p>Cette page n&apos;existe pas ou n&apos;est pas encore disponible.</p>
        </ErrorState>
      </main>
      <SiteFooter />
    </>
  );
}
