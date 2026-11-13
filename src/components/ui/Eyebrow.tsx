import clsx from "clsx";
import type { ReactNode } from "react";

/**
 * Surtitre en capitales (maquette : `.eyebrow`), précédé d'un carré accent de 6 px
 * (signature VERSUS). `tone="dark"` pour un fond sombre (quiz, tuiles noires).
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
        className={clsx("size-1.5 shrink-0", tone === "dark" ? "bg-accent-on-dark" : "bg-accent")}
      />
      {children}
    </Tag>
  );
}
