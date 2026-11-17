import { buttonClasses } from "@/components/ui/button-styles";

/**
 * Actions des pages d'erreur (composants client) : « Réessayer » et retour à l'accueil.
 *
 * Volontairement sans `Button`, `next/link` ni `config/site.ts` : les limites d'erreur sont
 * chargées sur chaque page, leur code s'ajoute au budget JavaScript (§7.1). Le lien est un `<a>`
 * natif vers « / » (route toujours livrée, et le routeur peut être indisponible ici).
 */
export function ErrorActions({ retry }: { retry: () => void }) {
  return (
    <>
      <button
        type="button"
        className={buttonClasses({ variant: "primary", size: "lg" })}
        onClick={() => retry()}
      >
        Réessayer
      </button>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- voir le commentaire ci-dessus */}
      <a href="/" className={buttonClasses({ variant: "outline", size: "lg" })}>
        Retour à l&apos;accueil
      </a>
    </>
  );
}
