import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

/**
 * Gabarit public (§3.1) : bandeau fictif, en-tête, <main id="contenu">, pied de page, dans cet
 * ordre. `banner` (header) et `contentinfo` (footer) restent au premier niveau, hors du <main>.
 * CompareTray, CartDrawer et Toaster s'ajouteront ici à l'étape 5.
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
