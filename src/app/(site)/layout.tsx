import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

/**
 * Gabarit public (§3.1) : bandeau fictif, en-tête, <main id="contenu">, pied de page, dans cet
 * ordre. `banner` (header) et `contentinfo` (footer) restent au premier niveau, hors du <main>.
 * Le mini-panier (CartDrawer) n'est pas posé ici : l'icône de l'en-tête (CartButton) le charge
 * à la première ouverture. CompareTray et Toaster arriveront avec le comparateur.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main id="contenu" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
