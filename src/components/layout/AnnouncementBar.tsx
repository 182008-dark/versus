import { site } from "@/config/site";

/**
 * Bandeau permanent « Projet pédagogique » (principe 7 du plan : le caractère fictif est
 * visible partout). Anciennement `FictiveNotice` (étape 1).
 *
 * Placé en tête de chaque gabarit de groupe et de chaque page hors groupe (`not-found.tsx`,
 * `error.tsx`, `global-error.tsx`, `/styleguide`), au-dessus de l'en-tête. Ce n'est pas un
 * landmark : `banner` reste l'en-tête du site.
 */
export function AnnouncementBar() {
  return (
    <div className="bg-notice-bg px-4 py-[9px] text-center text-xs leading-[normal] text-notice-ink">
      <p>
        <strong className="font-semibold text-white">{site.notice.lead}</strong> ·{" "}
        {site.notice.rest}
      </p>
    </div>
  );
}
