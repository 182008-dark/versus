import type { CSSProperties } from "react";
import { ProductVisual } from "@/components/product/ProductVisual";
import { Arrow } from "@/components/ui/Arrow";
import { Button } from "@/components/ui/Button";
import { NewBadge } from "@/components/ui/NewBadge";
import { productHref } from "@/config/site";
import { tileStyle, tileTheme } from "@/lib/brand-themes";
import type { HomeEntry } from "@/lib/catalog/types";

/**
 * Tuile promotionnelle (maquette : `.tile`), composant serveur. Couleurs et libellé de gamme
 * lus dans `tileThemes` (clé `home_slots.theme_key`) ; titre et accroche dans `home_slots`
 * (`headline`, `subline`) ou, à défaut, dans le produit. La première tuile occupe toute la
 * largeur.
 * - « Acheter » ouvre la fiche ; son nom accessible cite le produit (WCAG 2.4.4) ;
 * - « En savoir plus » mène à la même fiche : lien redondant pour la souris, retiré du clavier
 *   et des lecteurs d'écran ; « Comparer » arrive à l'étape 5.
 */
export function PromoTile({
  entry,
  isNew,
  featured,
}: {
  entry: HomeEntry;
  isNew: boolean;
  featured: boolean;
}) {
  const { product } = entry;
  const theme = tileTheme(entry.theme_key, product.brand_slug);
  const href = productHref(product.slug);
  return (
    <article
      data-product-card={product.code}
      data-brand={product.brand_slug}
      data-tone={theme.tone}
      className={featured ? "promo-tile promo-tile-featured" : "promo-tile"}
      style={tileStyle(theme) as CSSProperties}
    >
      <div className="promo-tile-copy reveal">
        {isNew ? (
          <NewBadge tone={theme.tone === "dark" ? "onDark" : "accent"} />
        ) : (
          <p className="promo-tile-eyebrow">{theme.eyebrow}</p>
        )}
        <h2 className="promo-tile-title">{entry.headline ?? product.name}</h2>
        <p className="promo-tile-sub">{entry.subline ?? product.tagline}</p>
        <div className="promo-tile-links">
          <Button
            href={href}
            variant={theme.button}
            className="h-11 px-[22px]"
            aria-label={`Acheter ${product.name}`}
          >
            Acheter
          </Button>
          {featured ? null : (
            <a className="promo-learn" href={href} tabIndex={-1} aria-hidden="true">
              En savoir plus <Arrow />
            </a>
          )}
        </div>
      </div>
      <ProductVisual
        product={product}
        decorative
        sizes="(max-width: 640px) 260px, 330px"
        className="promo-tile-art rise"
      />
    </article>
  );
}
