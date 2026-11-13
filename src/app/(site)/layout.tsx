import { site } from "@/config/site";

/**
 * Gabarit public minimal de l'étape 1.
 * Le bandeau « fictif » est ici pour être visible sur toutes les pages publiques ;
 * l'en-tête et le pied de page s'ajouteront autour du <main> à l'étape 2.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <div className="bg-notice-bg px-4 py-2 text-center text-xs text-notice-ink">
        <p>
          <strong className="font-semibold text-white">{site.notice.lead}</strong> ·{" "}
          {site.notice.rest}
        </p>
      </div>
      <main id="contenu" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {children}
      </main>
    </>
  );
}
