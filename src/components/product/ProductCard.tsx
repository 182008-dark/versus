import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { NewBadge } from "@/components/ui/NewBadge";
import { Price } from "@/components/ui/Price";
import { ProductVisual } from "./ProductVisual";
import type { ProductCardData } from "@/lib/catalog/types";
import { productHref } from "@/config/site";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardData;
  priority?: boolean;
}) {
  return (
    <article
      data-product-card={product.code}
      data-brand={product.brand_slug}
      className="flex min-h-[440px] min-w-0 flex-col rounded-card bg-brand-ground p-5 transition-[translate,box-shadow] duration-300 sm:p-6 state-hover:-translate-y-1 state-hover:shadow-card"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold tracking-[0.12em] text-brand-ink uppercase">
          {product.brand_name}
        </span>
        {product.is_new ? <NewBadge /> : <Badge tone="neutral"> {product.category_slug}</Badge>}
      </div>
      <ProductVisual
        product={product}
        priority={priority}
        className="mx-auto mt-3 flex h-[190px] w-full max-w-[190px] items-center justify-center"
      />
      <div className="mt-auto">
        <h3 className="font-display text-xl leading-tight font-bold tracking-[-0.03em]">
          {product.name}
        </h3>
        <p className="mt-2 min-h-10 text-sm leading-relaxed text-muted">{product.tagline}</p>
        <p className="mt-3 text-sm font-semibold">
          <Price amount={product.min_price_fcfa} prefix="Dès" />
        </p>
        <Button href={productHref(product.slug)} size="md" className="mt-4 w-full">
          Acheter
        </Button>
      </div>
    </article>
  );
}
