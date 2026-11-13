/**
 * Lien d'évitement : premier élément focalisable de chaque page, il mène au contenu principal
 * (`<main id="contenu">`). Invisible tant qu'il n'a pas le focus ; placé au-dessus de l'en-tête
 * collant (z-index 60 > 50).
 */
export function SkipLink({ targetId = "contenu" }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only z-[60] rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Aller au contenu
    </a>
  );
}
