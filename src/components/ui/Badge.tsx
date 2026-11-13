import clsx from "clsx";
import type { ReactNode } from "react";

export const BADGE_TONES = ["accent", "neutral", "onDark"] as const;
export type BadgeTone = (typeof BADGE_TONES)[number];

const tones: Record<BadgeTone, string> = {
  accent: "bg-accent-soft text-accent-hover",
  neutral: "bg-surface text-ink",
  onDark: "bg-on-dark/15 text-on-dark",
};

/** Capsule d'information (« Nouveau », « En stock »…), signature VERSUS. */
export function Badge({
  tone = "accent",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] leading-none font-semibold whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
