import clsx from "clsx";
import { NBSP, formatFCFAParts } from "@/lib/format/fcfa";

export const PRICE_SIZES = ["card", "lead", "inline"] as const;
export type PriceSize = (typeof PRICE_SIZES)[number];

const sizes: Record<PriceSize, string> = {
  /** Carte produit : 17 px, puis 20 px dès 641 px. */
  card: "font-display text-[length:var(--text-price-card)] leading-tight font-bold text-price",
  /** Hero et bandeau de marque : 22 px, puis 28 px dès 641 px. */
  lead: "font-display text-[length:var(--text-price-lead)] leading-tight font-bold text-price",
  /** Dans une phrase ou une liste : taille et couleur du texte autour. */
  inline: "font-semibold",
};

/** Plus petit montant, et « Dès » s'il existe plusieurs prix différents. */
export function priceRange(amounts: readonly number[]): { amount: number; from: boolean } {
  if (amounts.length === 0) throw new RangeError("Aucun prix à afficher.");
  return { amount: Math.min(...amounts), from: new Set(amounts).size > 1 };
}

/**
 * Prix en FCFA (§4.7 du plan de refonte), seule forme d'affichage d'un montant :
 * « Dès 970 000 FCFA ». Préfixe unique « Dès », absent quand il n'y a qu'un seul prix ; chiffres
 * alignés ; jamais coupé entre deux lignes (espaces insécables et `white-space: nowrap`).
 * « Dès » et « FCFA » en Inter 600, gris foncé, à 0,7 fois la taille du montant.
 *
 * - `amount` : un montant, ou la liste des prix des variantes (le plus petit est affiché, avec
 *   « Dès » s'ils diffèrent) ;
 * - `from` : force ou retire « Dès » (un montant seul n'en a pas par défaut).
 */
export function Price({
  amount,
  from,
  size = "inline",
  className,
}: {
  amount: number | readonly number[];
  from?: boolean;
  size?: PriceSize;
  className?: string;
}) {
  const range = typeof amount === "number" ? { amount, from: false } : priceRange(amount);
  const showFrom = from ?? range.from;
  const parts = formatFCFAParts(range.amount);
  const affix =
    size === "inline" ? undefined : "font-sans text-[0.7em] font-semibold text-muted-strong";

  return (
    <span data-price className={clsx("whitespace-nowrap tabular-nums", sizes[size], className)}>
      {showFrom ? <span className={affix}>{`Dès${NBSP}`}</span> : null}
      <span>{parts.amount}</span>
      <span className={affix}>{`${NBSP}${parts.unit}`}</span>
    </span>
  );
}
