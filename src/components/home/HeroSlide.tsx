import { ProductVisual } from "@/components/product/ProductVisual";
import { Button } from "@/components/ui/Button";
import { productHref } from "@/config/site";
import { formatFCFA } from "@/lib/format/fcfa";
import type { HomeEntry } from "@/lib/catalog/types";

/**
 * Contenu d'une diapositive du hero (maquette : `.slide-in`), composant serveur : texte, prix,
 * « Acheter » et visuel ne pèsent rien dans le JavaScript. Le badge « Nouveau » est retiré des
 * puces du hero (§4.5) ; « Comparer » reste masqué jusqu'à l'étape 5.
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
  return (
    <div className="hero-slide-inner wrap">
      <div className="hero-text">
        <p className="hero-eyebrow">{product.brand_name}</p>
        <h2 className="hero-title">{headline ?? product.name}</h2>
        <p className="hero-sub">{subline ?? product.tagline}</p>
        {product.min_price_fcfa !== null ? (
          <p className="hero-price">À partir de {formatFCFA(product.min_price_fcfa)}</p>
        ) : null}
        <div className="hero-cta">
          <Button
            href={productHref(product.slug)}
            variant={tone === "dark" ? "light" : "dark"}
            size="lg"
            aria-label={`Acheter ${product.name}`}
          >
            Acheter
          </Button>
        </div>
      </div>
      <div className="hero-art">
        <span aria-hidden="true" className="hero-halo" />
        <span aria-hidden="true" className="hero-ring" />
        <div className="hero-art-in">
          <div className="hero-float">
            <ProductVisual
              product={product}
              decorative
              priority={priority}
              sizes="(max-width: 900px) 300px, 36vw"
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
