import clsx from "clsx";
import type { ColorSwatch } from "@/lib/catalog/brand-page";

/** Pastilles affichées au plus ; les suivantes sont résumées par « +N ». */
const MAX_SWATCHES = 4;

/**
 * Ligne « catégorie · coloris » d'une carte produit (§3.2 du plan de refonte : liste mobile
 * « nom, catégorie, coloris et prix »), composant serveur. Les pastilles sont décoratives
 * (`aria-hidden`) ; les noms des coloris sont lus par les lecteurs d'écran. Une couleur absente
 * (`color_hex` nul) laisse une pastille neutre.
 */
export function ProductCardMeta({
  category,
  swatches = [],
  className,
}: {
  category?: string;
  swatches?: readonly ColorSwatch[];
  className?: string;
}) {
  const shown = swatches.slice(0, MAX_SWATCHES);
  const hidden = swatches.length - shown.length;
  return (
    <p
      data-card-meta=""
      className={clsx(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-snug text-muted-strong",
        className,
      )}
    >
      {category ? <span data-card-category="">{category}</span> : null}
      {shown.length > 0 ? (
        <span data-card-swatches="" className="inline-flex items-center gap-1">
          <span className="sr-only">
            {category ? ", " : ""}
            {`coloris : ${swatches.map((swatch) => swatch.name).join(", ")}`}
          </span>
          {shown.map((swatch) => (
            <span
              key={swatch.slug}
              aria-hidden="true"
              className="size-3 shrink-0 rounded-full border border-line-control bg-surface"
              style={swatch.hex ? { backgroundColor: swatch.hex } : undefined}
            />
          ))}
          {hidden > 0 ? (
            <span aria-hidden="true" className="tabular-nums">
              +{hidden}
            </span>
          ) : null}
        </span>
      ) : null}
    </p>
  );
}
