import type { CSSProperties } from "react";
import { ProductVisual, type VisualProduct } from "@/components/product/ProductVisual";
import { Arrow } from "@/components/ui/Arrow";
import { Price } from "@/components/ui/Price";
import { brandCardStyle } from "@/lib/brand-themes";
import type { CatalogBrand } from "@/lib/catalog/types";
import { productCount } from "@/lib/catalog/summary";

/**
 * Carte « Parcourir par marque » (refonte, §3.1 et §4.7), composant serveur. La carte entière
 * mène à la page de la marque (`/marques/<marque>`) : fond pastel, filet de 3 px à la couleur de
 * la marque, nom, accroche, « 10 produits · Dès 43 000 FCFA » (calculés par l'appelant à partir
 * du catalogue), « Voir Samsung → » et 3 vignettes décoratives, sans chevauchement.
 * Sous 901 px, rangée compacte de 112 px (accroche et deux vignettes masquées).
 */
export function BrandCard({
  brand,
  products,
  count,
  minPrice,
  href,
}: {
  brand: CatalogBrand;
  products: readonly VisualProduct[];
  count: number;
  minPrice: number | null;
  href: string;
}) {
  return (
    <a
      href={href}
      data-brand={brand.slug}
      className="brand-card"
      style={brandCardStyle(brand.slug) as CSSProperties}
    >
      <span className="brand-card-copy">
        <h3 className="brand-card-name">{brand.name}</h3>
        <span className="brand-card-tagline">{brand.tagline}</span>
        <span className="brand-card-summary">
          {productCount(count)}
          {minPrice !== null ? (
            <>
              {" · "}
              <Price amount={minPrice} from />
            </>
          ) : null}
        </span>
        <span className="brand-card-go">
          Voir {brand.name} <Arrow />
        </span>
      </span>
      <span aria-hidden="true" className="brand-card-products">
        {products.map((product) => (
          <ProductVisual
            key={product.code}
            product={product}
            decorative
            sizes="(max-width: 900px) 72px, 120px"
            className="brand-card-art"
          />
        ))}
      </span>
    </a>
  );
}
