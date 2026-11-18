import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { NewBadge } from "@/components/ui/NewBadge";
import { Price } from "@/components/ui/Price";
import { productHref } from "@/config/site";
import type { ColorSwatch } from "@/lib/catalog/brand-page";
import type { CatalogProductRow } from "@/lib/catalog/types";
import { compact, featured as featuredClasses, list } from "./product-card-layout";
import { ProductCardMeta } from "./ProductCardMeta";
import { ProductVisual } from "./ProductVisual";

export type ProductCardData = CatalogProductRow & { is_new: boolean };

/**
 * Contenu d'une carte produit (`ProductCard`) : marque et badge, visuel, nom, catégorie et
 * coloris, accroche, prix de carte (`<Price size="card">`, 17 puis 20 px, §4.6) et, avec
 * `action`, le bouton vers la fiche. Sans `action`, la carte entière est déjà le lien.
 */
export function ProductCardContent({
  product,
  adaptive,
  big,
  hasMeta,
  category,
  swatches,
  action,
}: {
  product: ProductCardData;
  adaptive: boolean;
  big: boolean;
  hasMeta: boolean;
  category?: string;
  swatches?: readonly ColorSwatch[];
  action?: string;
}) {
  return (
    <>
      <div
        className={clsx(
          "flex min-h-6 items-center justify-between gap-2",
          adaptive && list.right,
          big && featuredClasses.header,
        )}
      >
        <span data-card-brand="" className="text-meta text-brand-ink">
          {product.brand_name}
        </span>
        {product.is_new ? <NewBadge /> : null}
      </div>
      <ProductVisual
        product={product}
        decorative
        sizes={
          !adaptive
            ? "220px"
            : big
              ? "(max-width: 399px) 88px, (max-width: 900px) 220px, 300px"
              : "(max-width: 399px) 88px, 220px"
        }
        className={clsx(
          "mt-3.5 mb-1.5 flex h-[220px] w-full items-center justify-center",
          adaptive && [compact.visual, list.visual],
          big && featuredClasses.visual,
        )}
      />
      <h3
        className={clsx(
          "mt-2 mb-1.5 font-display text-[21px] leading-[1.15] font-bold",
          adaptive && [compact.name, list.right, list.name],
          big && featuredClasses.name,
        )}
      >
        {product.name}
      </h3>
      {hasMeta ? (
        <ProductCardMeta
          category={category}
          swatches={swatches}
          className={clsx(adaptive && list.right, big && featuredClasses.meta)}
        />
      ) : null}
      <p
        className={clsx(
          "flex-1 text-[14.5px] leading-[1.45] text-muted-strong",
          hasMeta && "mt-2",
          adaptive && compact.tagline,
          big && featuredClasses.tagline,
        )}
      >
        {product.tagline}
      </p>
      <p
        className={clsx(
          "mt-3.5 mb-3 text-[15px] font-semibold",
          adaptive && [compact.price, list.right],
          big && featuredClasses.price,
        )}
      >
        {product.min_price_fcfa !== null ? (
          <Price
            amount={[product.min_price_fcfa, product.max_price_fcfa ?? product.min_price_fcfa]}
            size="card"
          />
        ) : (
          "Prix indisponible"
        )}
      </p>
      {action ? (
        <Button
          href={productHref(product.slug)}
          size="md"
          className={clsx(
            "w-full",
            adaptive && [compact.button, list.right],
            big && featuredClasses.button,
          )}
          aria-label={`${action} ${product.name}`}
        >
          {action}
        </Button>
      ) : null}
    </>
  );
}
