import clsx from "clsx";

/**
 * Classes du composant Button (§4.3), séparées pour être testées et réutilisées
 * (un lien stylé en bouton, un bouton de formulaire…).
 *
 * Correspondance avec la maquette :
 * - `primary` : btn-buy et pill-btn bleus → accent vert VERSUS ;
 * - `dark` : btn-d ; `light` : btn-l ; `outline` : cmp-btn (avec `pressed`) ;
 * - `onDark` : pill-btn « Comparer » des tuiles sombres ; `brand` : pill-btn aux couleurs de la
 *   marque, lues dans `[data-brand]` (--brand-acc, --brand-on-acc).
 *
 * Tailles : `md` = 44 px (cible tactile minimale), `lg` = 48 px.
 * L'agrandissement au survol (scale 1,04) n'existe que sans mouvement réduit (`motion-safe`).
 */

export const BUTTON_VARIANTS = ["primary", "dark", "light", "outline", "onDark", "brand"] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

export const BUTTON_SIZES = ["md", "lg"] as const;
export type ButtonSize = (typeof BUTTON_SIZES)[number];

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap no-underline select-none " +
  "transition-[scale,background-color,color,border-color,filter] duration-250 ease-out " +
  "motion-safe:state-hover:scale-104 motion-safe:state-active:scale-100 " +
  "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40";

const sizes: Record<ButtonSize, string> = {
  md: "h-11 px-[22px] text-[15px]",
  lg: "h-12 px-[26px] text-[15px]",
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent state-hover:bg-accent-hover state-active:bg-accent-hover",
  dark: "bg-ink text-white state-hover:bg-ink-strong state-active:bg-ink-strong",
  light:
    "bg-surface text-ink state-hover:bg-white state-hover:text-ink-strong state-active:bg-surface-hover",
  outline:
    "border border-line-strong bg-transparent text-ink state-hover:border-ink " +
    "aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-white",
  onDark:
    "border border-on-dark/40 bg-transparent text-on-dark state-hover:border-on-dark " +
    "aria-pressed:border-on-dark aria-pressed:bg-on-dark aria-pressed:text-ink",
  brand: "bg-brand-acc text-brand-on-acc state-hover:brightness-110 state-active:brightness-95",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return clsx(base, sizes[size], variants[variant], className);
}
