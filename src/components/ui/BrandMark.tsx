import clsx from "clsx";
import Link from "next/link";
import { brandThemes, type Brand } from "@/lib/brand-themes";

export const BRAND_MARK_SIZES = ["meta", "lead"] as const;
export type BrandMarkSize = (typeof BRAND_MARK_SIZES)[number];

const sizes: Record<BrandMarkSize, { text: string; dot: string }> = {
  /** Méta des cartes et fiches : 13 px, pastille de 8 px. */
  meta: { text: "gap-2 text-meta", dot: "size-2" },
  /** Bandeaux et en-têtes : 16 px, pastille de 10 px. */
  lead: { text: "gap-2.5 text-base leading-tight font-semibold", dot: "size-2.5" },
};

/**
 * Pastille de marque (§4.7 du plan de refonte) : point de couleur + nom en casse normale. Elle
 * remplace le surtitre en petites capitales. Le point est décoratif (`--brand-mark`, jamais seul) ;
 * le nom porte l'information, à l'encre de la marque (AA sur son fond, sur blanc et sur la
 * surface). Pose son propre `data-brand` : utilisable sur n'importe quel fond clair.
 *
 * `href` en fait un lien (page de la marque, lot 3) ; `tone="onDark"` pour un fond sombre ;
 * `tone="inherit"` reprend la couleur du texte voisin, pastille comprise (hero de l'accueil, dont
 * le fond est à la couleur de la marque : la pastille de marque y serait invisible).
 */
export function BrandMark({
  brand,
  size = "meta",
  tone = "light",
  href,
  className,
}: {
  brand: Brand;
  size?: BrandMarkSize;
  tone?: "light" | "onDark" | "inherit";
  href?: string;
  className?: string;
}) {
  const classes = clsx(
    "inline-flex items-center",
    sizes[size].text,
    { light: "text-brand-ink", onDark: "text-on-dark", inherit: "text-current" }[tone],
    href && "min-h-11 underline-offset-4 state-hover:underline",
    className,
  );
  const content = (
    <>
      <span
        aria-hidden="true"
        data-brand-dot=""
        className={clsx(
          "shrink-0 rounded-full",
          tone === "inherit" ? "bg-current" : "bg-brand-mark",
          sizes[size].dot,
        )}
      />
      {brandThemes[brand].label}
    </>
  );

  if (href) {
    return (
      <Link href={href} data-brand={brand} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <span data-brand={brand} className={classes}>
      {content}
    </span>
  );
}
