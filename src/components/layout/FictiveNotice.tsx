import { site } from "@/config/site";

/**
 * Bandeau permanent « Projet pédagogique » (principe 7 du plan : le caractère fictif est
 * visible partout). Utilisé par chaque gabarit de groupe et par les pages hors groupe
 * (`not-found.tsx`, plus tard `global-error.tsx`), au-dessus de leur `<main id="contenu">`.
 */
export function FictiveNotice() {
  return (
    <div className="bg-notice-bg px-4 py-2 text-center text-xs text-notice-ink">
      <p>
        <strong className="font-semibold text-white">{site.notice.lead}</strong> ·{" "}
        {site.notice.rest}
      </p>
    </div>
  );
}
