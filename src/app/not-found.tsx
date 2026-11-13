import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page introuvable",
};

// Page hors groupe : elle déclare son propre <main id="contenu"> (§3.4 du plan).
export default function NotFound() {
  return (
    <main
      id="contenu"
      tabIndex={-1}
      className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center outline-none"
    >
      <p className="text-sm font-semibold tracking-widest text-ink-muted uppercase">Erreur 404</p>
      <h1 className="text-4xl font-extrabold">Page introuvable</h1>
      <p className="max-w-md text-ink-muted">
        Cette page n&apos;existe pas ou n&apos;est pas encore disponible.
      </p>
      <Link href="/" className="font-semibold underline underline-offset-4">
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
