/**
 * Lien d'évitement : premier élément focalisable de chaque page, il mène au contenu principal
 * (`<main id="contenu">`).
 * - Toujours rendu (pas de `sr-only`), mais sorti de l'écran par le haut tant qu'il n'a pas le
 *   focus : il garde ainsi ses marges et sa hauteur de 44 px une fois affiché.
 * - Capsule claire bordée : elle se détache du bandeau sombre qu'elle recouvre.
 * - Au-dessus de l'en-tête collant (z-index 60 > 50).
 */
export function SkipLink({ targetId = "contenu" }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="fixed top-3 left-3 z-[60] inline-flex min-h-11 -translate-y-[200%] items-center rounded-full border border-line bg-bg px-5 text-sm font-semibold text-ink focus:translate-y-0"
    >
      Aller au contenu
    </a>
  );
}
