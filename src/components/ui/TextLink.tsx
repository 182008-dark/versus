import clsx from "clsx";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Arrow } from "./Arrow";

export const TEXT_LINK_TONES = ["accent", "accentInk", "ink", "light", "accentOnDark"] as const;
export type TextLinkTone = (typeof TEXT_LINK_TONES)[number];

const tones: Record<TextLinkTone, string> = {
  accent: "text-accent state-hover:text-accent-hover",
  /** Sur une surface grise : vert foncé (le vert VERSUS n'y suffit pas toujours). */
  accentInk: "text-accent-ink state-hover:text-ink",
  ink: "text-ink state-hover:text-ink-strong",
  light: "text-surface state-hover:text-on-dark",
  accentOnDark: "text-accent-on-dark state-hover:text-on-dark",
};

type TextLinkProps = Omit<ComponentProps<typeof Link>, "className" | "children"> & {
  href: string;
  tone?: TextLinkTone;
  /** Ajoute la flèche « → » (lien fléché, signature VERSUS). */
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Lien d'action (maquette : lnk-l, lnk-d, « Découvrir › »…). Hauteur de 44 px au moins pour
 * la cible tactile. Pour un lien dans un paragraphe, utiliser un `<Link>` souligné.
 */
export function TextLink({
  tone = "accent",
  arrow = false,
  className,
  children,
  ...rest
}: TextLinkProps) {
  return (
    <Link
      className={clsx(
        "inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold transition-colors duration-(--dur-base)",
        tones[tone],
        className,
      )}
      {...rest}
    >
      {children}
      {arrow ? <Arrow /> : null}
    </Link>
  );
}
