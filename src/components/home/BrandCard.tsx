import type { CSSProperties } from "react";
import { ProductVisual, type VisualProduct } from "@/components/product/ProductVisual";
import { Arrow } from "@/components/ui/Arrow";
import { brandCardStyle } from "@/lib/brand-themes";
import type { CatalogBrand } from "@/lib/catalog/types";

/**
 * Carte d'univers de marque (maquette : `.brand`), composant serveur. Lien vers `href` : la page
 * de la marque (`/marques/[marque]`, refonte, lot 3). Nom accessible court : le visuel
 * est décoratif, donc le lien se lit « Apple iPhone, AirPods et Apple Watch. Découvrir ».
 */
export function BrandCard({
  brand,
  visual,
  href,
}: {
  brand: CatalogBrand;
  visual: VisualProduct | undefined;
  href: string;
}) {
  return (
    <a
      href={href}
      data-brand={brand.slug}
      className="brand-card zoom"
      style={brandCardStyle(brand.slug) as CSSProperties}
    >
      <h3>{brand.name}</h3>
      <p>{brand.tagline}</p>
      <span className="brand-card-go">
        Découvrir <Arrow />
      </span>
      {visual ? (
        <ProductVisual product={visual} decorative sizes="260px" className="brand-card-art" />
      ) : null}
    </a>
  );
}
