import { site } from "@/config/site";

/**
 * Bandeau permanent « Projet pédagogique » (principe 7 du plan : le caractère fictif est
 * visible partout). Anciennement `FictiveNotice` (étape 1).
 *
 * Placé en tête de chaque gabarit de groupe et de chaque page hors groupe (`not-found.tsx`,
 * `error.tsx`, `global-error.tsx`, `/styleguide`), au-dessus de l'en-tête. C'est une région
 * nommée « Avertissement » : un lecteur d'écran qui parcourt les landmarks la trouve, et
 * `banner` reste l'en-tête du site.
 */
export function AnnouncementBar() {
  return (
    <section
      aria-label="Avertissement"
      className="bg-notice-bg px-4 py-[9px] text-center text-xs leading-[normal] text-notice-ink"
    >
      <p>
        <strong className="font-semibold text-on-dark">{site.notice.lead}</strong> ·{" "}
        {site.notice.rest}
      </p>
    </section>
  );
}
