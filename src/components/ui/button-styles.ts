import clsx from "clsx";

/**
 * Classes du composant Button, séparées pour être testées et réutilisées (un lien stylé en
 * bouton, un bouton de formulaire…).
 *
 * Trois variantes depuis la refonte (lot 2) :
 * - `primary` : l'action principale, **toujours verte**, y compris sur fond sombre ;
 * - `secondary` : contour, et bouton bascule avec `pressed` (comparer, filtres) ;
 * - `onDark` : secondaire sur fond sombre.
 *
 * Une couleur de marque ne sert jamais à une action : `brand` est retiré, comme `dark` et
 * `light`. Ces noms restent des **alias temporaires** (`LEGACY_BUTTON_VARIANTS`) pour que les pages
 * refaites aux lots 3 à 5 compilent sans changement ; ils seront supprimés ensuite.
 *
 * Tailles : `md` = 44 px (cible tactile minimale), `lg` = 48 px. Pas d'agrandissement au survol ;
 * léger enfoncement (`scale(.97)`) à l'appui, seulement sans mouvement réduit (`motion-safe`).
 */

export const BUTTON_VARIANTS = ["primary", "secondary", "onDark"] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

/** Anciens noms → variante actuelle (alias temporaires de la migration). */
export const LEGACY_BUTTON_VARIANTS = {
  dark: "primary",
  light: "primary",
  brand: "primary",
  outline: "secondary",
} as const satisfies Record<string, ButtonVariant>;
export type LegacyButtonVariant = keyof typeof LEGACY_BUTTON_VARIANTS;

export const BUTTON_SIZES = ["md", "lg"] as const;
export type ButtonSize = (typeof BUTTON_SIZES)[number];

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap no-underline select-none " +
  "transition-[scale,background-color,color,border-color] duration-(--dur-base) ease-out " +
  "motion-safe:state-active:scale-97 state-active:duration-(--dur-fast) " +
  "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40";

const sizes: Record<ButtonSize, string> = {
  md: "h-11 px-[22px] text-[15px]",
  lg: "h-12 px-[26px] text-[15px]",
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent state-hover:bg-accent-hover state-active:bg-accent-hover",
  secondary:
    "border border-line-control bg-transparent text-ink state-hover:border-ink " +
    "aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-on-dark",
  onDark:
    "border border-on-dark/40 bg-transparent text-on-dark state-hover:border-on-dark " +
    "aria-pressed:border-on-dark aria-pressed:bg-on-dark aria-pressed:text-ink",
};

/** Variante actuelle d'un nom, ancien ou nouveau. */
export function resolveButtonVariant(variant: ButtonVariant | LegacyButtonVariant): ButtonVariant {
  return variant in LEGACY_BUTTON_VARIANTS
    ? LEGACY_BUTTON_VARIANTS[variant as LegacyButtonVariant]
    : (variant as ButtonVariant);
}

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant | LegacyButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return clsx(base, sizes[size], variants[resolveButtonVariant(variant)], className);
}
