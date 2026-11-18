/**
 * Classes de `buttonClasses({ size: "lg", variant: "primary" | "secondary" })`, écrites ici en
 * toutes lettres : ce module est copié dans les trois limites d'erreur chargées sur chaque page, et
 * importer les styles du bouton les y copierait aussi (budget JavaScript). `ErrorActions.test.tsx`
 * vérifie qu'elles restent identiques à celles de `buttonClasses`.
 */
const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap no-underline select-none transition-[scale,background-color,color,border-color] duration-(--dur-base) ease-out motion-safe:state-active:scale-97 state-active:duration-(--dur-fast) disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40 h-12 px-[26px] text-[15px]";
const errorPrimaryClasses = `${base} bg-accent text-on-accent state-hover:bg-accent-hover state-active:bg-accent-hover`;
const errorSecondaryClasses = `${base} border border-line-control bg-transparent text-ink state-hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-on-dark`;

/**
 * Actions des pages d'erreur (composants client) : « Réessayer » et retour à l'accueil.
 *
 * Volontairement sans `Button`, `button-styles.ts`, `next/link` ni `config/site.ts` : les limites d'erreur sont
 * chargées sur chaque page, leur code s'ajoute au budget JavaScript (§7.1). Le lien est un `<a>`
 * natif vers « / » (route toujours livrée, et le routeur peut être indisponible ici).
 */
export function ErrorActions({ retry }: { retry: () => void }) {
  return (
    <>
      <button type="button" className={errorPrimaryClasses} onClick={() => retry()}>
        Réessayer
      </button>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- voir le commentaire ci-dessus */}
      <a href="/" className={errorSecondaryClasses}>
        Retour à l&apos;accueil
      </a>
    </>
  );
}
