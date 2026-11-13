import { ProductVisual } from "@/components/product/ProductVisual";
import { Arrow } from "@/components/ui/Arrow";
import { routeFor } from "@/config/site";
import type { CatalogProduct } from "@/lib/catalog/types";

export function BrandCard({
  brand,
  tagline,
  visual,
}: {
  brand: CatalogProduct["brand_slug"];
  tagline: string;
  visual: CatalogProduct;
}) {
  const href = routeFor("boutique");
  if (!href) return null;
  const labels = { apple: "Apple", samsung: "Samsung", xiaomi: "Xiaomi" };

  return (
    <a href={href} data-brand={brand} className="brand-card zoom">
      <h3>{labels[brand]}</h3>
      <p>{tagline}</p>
      <span className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold">
        Découvrir <Arrow />
      </span>
      <ProductVisual
        product={visual}
        sizes="(max-width: 640px) 48vw, 260px"
        className="brand-card-image"
      />
    </a>
  );
}
