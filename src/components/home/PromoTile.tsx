import type { CSSProperties } from "react";
import { ProductVisual } from "@/components/product/ProductVisual";
import { BrandMark } from "@/components/ui/BrandMark";
import { Button } from "@/components/ui/Button";
import { NewBadge } from "@/components/ui/NewBadge";
import { Price } from "@/components/ui/Price";
import { brandHref, productHref } from "@/config/site";
import { tileStyle, tileTheme } from "@/lib/brand-themes";
import type { HomeEntry } from "@/lib/catalog/types";

/**
 * Tuile promotionnelle (refonte, §3.1 et §4.7), composant serveur. Couleurs lues dans
 * `tileThemes` (clé `home_slots.theme_key`, ton clair ou sombre), titre et accroche dans
 * `home_slots` (`headline`, `subline`) ou, à défaut, dans le produit. La première tuile occupe
 * toute la largeur.
 * - badge de marque cliquable (page de la marque), suivi de « Nouveau » si le produit est récent ;
 * - prix comme sur les cartes produit (« Dès » si les variantes ont plusieurs prix) ;
 * - une action unique et centrée, « Voir le produit » (règle 4 de la direction).
 * Sous 641 px, 420 px de haut au plus.
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
  const brandPage = brandHref(product.brand_slug);
  return (
    <article
      data-product-card={product.code}
      data-brand={product.brand_slug}
      data-tone={theme.tone}
      className={featured ? "promo-tile promo-tile-featured" : "promo-tile"}
      style={tileStyle(theme) as CSSProperties}
    >
      <div className="promo-tile-copy reveal">
        <p className="promo-tile-badges">
          <BrandMark
            brand={product.brand_slug}
            tone={theme.tone === "dark" ? "onDark" : "light"}
            href={brandPage ?? undefined}
          />
          {isNew ? <NewBadge tone={theme.tone === "dark" ? "onDark" : "new"} /> : null}
        </p>
        <h2 className="promo-tile-title">{entry.headline ?? product.name}</h2>
        <p className="promo-tile-sub">{entry.subline ?? product.tagline}</p>
        {product.min_price_fcfa !== null ? (
          <p className="promo-tile-price">
            <Price
              amount={[product.min_price_fcfa, product.max_price_fcfa ?? product.min_price_fcfa]}
              size="card"
            />
          </p>
        ) : null}
        <div className="promo-tile-links">
          <Button
            href={productHref(product.slug)}
            variant="primary"
            aria-label={`Voir le produit ${product.name}`}
          >
            Voir le produit
          </Button>
        </div>
      </div>
      <ProductVisual
        product={product}
        decorative
        sizes="(max-width: 640px) 200px, 330px"
        className="promo-tile-art rise"
      />
    </article>
  );
}
