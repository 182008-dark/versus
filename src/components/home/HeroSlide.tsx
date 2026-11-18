import { ProductVisual } from "@/components/product/ProductVisual";
import { BrandMark } from "@/components/ui/BrandMark";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { brandHref, productHref, routeFor } from "@/config/site";
import { brandThemes } from "@/lib/brand-themes";
import type { HomeEntry } from "@/lib/catalog/types";
import { seeLabel } from "@/lib/format/see-label";

/**
 * Contenu d'une diapositive du hero (refonte, §3.1), composant serveur : rien de ce texte ni du
 * visuel ne pèse dans le JavaScript.
 * - pastille de marque cliquable au-dessus du titre (page de la marque) ;
 * - prix grand juste après le nom (`<Price size="lead">` : 22 px, 28 px dès 641 px, « Dès ») ;
 * - deux actions : « Voir l'iPhone 18 Pro » (bouton vert, la fiche) et « Tout Apple » (la page
 *   de la marque), plus « Comparer » en lien discret vers le comparateur de l'accueil.
 * Le badge « Nouveau » est retiré des diapositives (§4.5).
 */
export function HeroSlide({
  entry: { product, headline, subline },
  tone,
  priority,
}: {
  entry: HomeEntry;
  tone: "dark" | "light";
  priority: boolean;
}) {
  const compareHref = routeFor("comparerAccueil");
  const brandPage = brandHref(product.brand_slug);
  const name = headline ?? product.name;

  return (
    <div className="hero-slide-inner wrap">
      <div className="hero-text">
        <BrandMark
          brand={product.brand_slug}
          size="lead"
          tone="inherit"
          href={brandPage ?? undefined}
          className="hero-brand"
        />
        <h2 className="hero-title">{name}</h2>
        <p className="hero-sub">{subline ?? product.tagline}</p>
        {product.min_price_fcfa !== null ? (
          <p className="hero-price">
            <Price
              amount={[product.min_price_fcfa, product.max_price_fcfa ?? product.min_price_fcfa]}
              size="lead"
            />
          </p>
        ) : null}
        <div className="hero-cta">
          <Button href={productHref(product.slug)} variant="primary" size="lg">
            {seeLabel(product.name)}
          </Button>
          {brandPage ? (
            <Button href={brandPage} variant={tone === "dark" ? "onDark" : "secondary"} size="lg">
              Tout {brandThemes[product.brand_slug].label}
            </Button>
          ) : null}
          {compareHref ? (
            <a className="hero-compare-link" href={compareHref}>
              Comparer
            </a>
          ) : null}
        </div>
      </div>
      <div className="hero-art">
        <span aria-hidden="true" className="hero-halo" />
        <span aria-hidden="true" className="hero-ring" />
        <div className="hero-art-in">
          <ProductVisual
            product={product}
            decorative
            priority={priority}
            sizes="(max-width: 900px) 240px, 36vw"
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
