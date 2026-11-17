import clsx from "clsx";

export const VS_MARK_SIZES = ["md", "sm"] as const;
export type VsMarkSize = (typeof VS_MARK_SIZES)[number];

const sizes: Record<VsMarkSize, string> = {
  /** Médaillon de 44 px : entre les cartes de marque, sélecteur, en-tête du comparateur. */
  md: "size-11 text-[13px]",
  /** 32 px : rangées compactes du téléphone. */
  sm: "size-8 text-[11px]",
};

/**
 * Médaillon « VS » (§4.7 du plan de refonte), signature de VERSUS, arbitre neutre entre les
 * marques. Rond à l'encre VERSUS, « VS » en Plus Jakarta Sans 800, anneau blanc de 3 px qui le
 * détache des cartes qu'il chevauche.
 *
 * Purement décoratif : masqué aux lecteurs d'écran (`aria-hidden`), jamais focalisable. Le texte
 * voisin dit déjà ce qui est comparé (« Apple, Samsung, Xiaomi »).
 */
export function VsMark({ size = "md", className }: { size?: VsMarkSize; className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-vs-mark=""
      className={clsx(
        "inline-grid shrink-0 place-items-center rounded-full bg-ink font-display leading-none font-extrabold tracking-[0.02em] text-on-dark ring-3 ring-bg select-none",
        sizes[size],
        className,
      )}
    >
      VS
    </span>
  );
}
