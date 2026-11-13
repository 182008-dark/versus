/** Lien d'évitement : premier élément focalisable, il mène au contenu principal. */
export function SkipLink({ targetId = "contenu" }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only z-50 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Aller au contenu
    </a>
  );
}
