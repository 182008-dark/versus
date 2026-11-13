import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { NewBadge } from "@/components/ui/NewBadge";
import { ProductVisual } from "@/components/product/ProductVisual";
import { productHref } from "@/config/site";
import type { ProductCardData } from "@/lib/catalog/types";

export function PromoTile({
  product,
  featured = false,
}: {
  product: ProductCardData;
  featured?: boolean;
}) {
  const tone =
    featured || product.code === "aw12"
      ? "dark"
      : product.brand_slug === "samsung"
        ? "dark"
        : "light";
  return (
    <article
      data-product-card={product.code}
      data-brand={product.brand_slug}
      className={`promo-tile ${featured ? "promo-tile-featured" : ""}`}
      data-tone={tone}
    >
      <div className="promo-tile-copy">
        {product.is_new ? (
          <NewBadge tone={tone === "dark" ? "onDark" : "accent"} />
        ) : (
          <Badge tone={tone === "dark" ? "onDark" : "neutral"}>{product.brand_name}</Badge>
        )}
        <h2 className="mt-3 text-display-tile">{product.name}</h2>
        <p className="promo-tile-description mt-3 max-w-[380px] text-base leading-relaxed">
          {product.tagline}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button href={productHref(product.slug)} variant={tone === "dark" ? "light" : "primary"}>
            Acheter
          </Button>
          <a className="promo-learn" href={productHref(product.slug)}>
            En savoir plus <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
      <ProductVisual
        product={product}
        sizes="(max-width: 640px) 75vw, (max-width: 1024px) 48vw, 42vw"
        className="promo-tile-image rise"
      />
    </article>
  );
}
