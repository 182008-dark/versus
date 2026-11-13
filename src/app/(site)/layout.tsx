import { FictiveNotice } from "@/components/layout/FictiveNotice";

/**
 * Gabarit public minimal de l'étape 1.
 * Le bandeau « fictif » est ici pour être visible sur toutes les pages publiques ;
 * l'en-tête et le pied de page s'ajouteront autour du <main> à l'étape 2.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <FictiveNotice />
      <main id="contenu" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {children}
      </main>
    </>
  );
}
