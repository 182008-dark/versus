import clsx from "clsx";
import type { ReactNode } from "react";

/**
 * Surtitre (alias temporaire de la refonte, lot 2) : casse normale, 13 px Inter 600, précédé d'une
 * pastille accent de 8 px. Il sera remplacé par `BrandMark` ou supprimé page par page (lots 3 à
 * 5). `tone="dark"` pour un fond sombre (quiz, tuiles noires).
 */
export function Eyebrow({
  as: Tag = "p",
  tone = "light",
  className,
  children,
}: {
  as?: "p" | "span" | "h2" | "h3";
  tone?: "light" | "dark";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={clsx(
        "flex items-center gap-2 eyebrow",
        tone === "dark" && "text-eyebrow-on-dark",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={clsx(
          "size-2 shrink-0 rounded-full",
          tone === "dark" ? "bg-accent-on-dark" : "bg-accent",
        )}
      />
      {children}
    </Tag>
  );
}
