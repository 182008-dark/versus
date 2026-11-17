import clsx from "clsx";
import type { ReactNode } from "react";

export const BADGE_TONES = ["new", "neutral", "muted", "brand", "onDark"] as const;
export type BadgeTone = (typeof BADGE_TONES)[number];
/** Ancien nom de `new` (alias temporaire de la refonte, lot 2). */
export type LegacyBadgeTone = "accent";

const tones: Record<BadgeTone, string> = {
  /** « Nouveau » : vert foncé sur vert pâle (5,79:1). */
  new: "bg-accent-soft text-badge-new-ink",
  neutral: "bg-surface text-ink",
  /** « Épuisé » : gris neutre, jamais vert. */
  muted: "bg-surface-hover text-muted-strong",
  /** Couleurs de la marque, lues dans `[data-brand]`. */
  brand: "bg-brand-ground text-brand-ink",
  onDark: "bg-on-dark/15 text-on-dark",
};

/**
 * Capsule d'information (« Nouveau », « Épuisé », marque), en casse normale : plus de petites
 * capitales depuis la refonte. Hauteur de 24 px, 12 px Inter 600, `rounded-full`.
 */
export function Badge({
  tone = "new",
  className,
  children,
}: {
  tone?: BadgeTone | LegacyBadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs leading-none font-semibold whitespace-nowrap",
        tones[tone === "accent" ? "new" : tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
