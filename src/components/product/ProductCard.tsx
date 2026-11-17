import { Button } from "@/components/ui/Button";
import { NewBadge } from "@/components/ui/NewBadge";
import { Price } from "@/components/ui/Price";
import { productHref } from "@/config/site";
import type { CatalogProductRow } from "@/lib/catalog/types";
import { ProductVisual } from "./ProductVisual";

export type ProductCardData = CatalogProductRow & { is_new: boolean };

/**
 * Carte produit (maquette : `.card`), composant serveur : marque, badge « Nouveau » (isNew),
 * visuel, nom, accroche, prix minimal, « Acheter » vers la fiche (le choix de la variante se
 * fait sur la fiche). « + Comparer » arrive à l'étape 5. Le visuel est décoratif : le titre
 * nomme déjà le produit, et « Acheter » porte son nom (WCAG 2.4.4).
 */
export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <article
      data-product-card={product.code}
      data-brand={product.brand_slug}
      className="flex h-full min-h-[470px] w-full min-w-0 flex-col rounded-card bg-brand-ground p-6 transition-[translate,box-shadow] duration-500 ease-out state-hover:-translate-y-2 state-hover:shadow-card"
    >
      <div className="flex min-h-6 items-center justify-between gap-2">
        <span className="text-xs font-bold tracking-[0.1em] text-brand-ink uppercase">
          {product.brand_name}
        </span>
        {product.is_new ? <NewBadge /> : null}
      </div>
      <ProductVisual
        product={product}
        decorative
        sizes="220px"
        className="mt-3.5 mb-1.5 flex h-[220px] w-full items-center justify-center"
      />
      <h3 className="mt-2 mb-1.5 font-display text-[21px] leading-[1.15] font-bold">
        {product.name}
      </h3>
      <p className="flex-1 text-[14.5px] leading-[1.45] text-muted-strong">{product.tagline}</p>
      <p className="mt-3.5 mb-3 text-[15px] font-semibold">
        {product.min_price_fcfa !== null ? (
          <Price amount={product.min_price_fcfa} prefix="Dès" />
        ) : (
          "Prix indisponible"
        )}
      </p>
      <Button
        href={productHref(product.slug)}
        size="md"
        className="w-full"
        aria-label={`Acheter ${product.name}`}
      >
        Acheter
      </Button>
    </article>
  );
}
