import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { NewBadge } from "@/components/ui/NewBadge";
import { Price } from "@/components/ui/Price";
import { productHref } from "@/config/site";
import type { CatalogProductRow } from "@/lib/catalog/types";
import { ProductVisual } from "./ProductVisual";

export type ProductCardData = CatalogProductRow & { is_new: boolean };

/**
 * Disposition de la carte :
 * - `stack` (défaut) : carte verticale, partout où elle est déjà employée (rail, boutique) ;
 * - `adaptive` : dans une grille `grid-products`, la carte passe **en liste** sous 400 px (photo
 *   à gauche ; marque, nom, prix et action à droite), pour qu'un Android de 360 px ne coupe ni le
 *   nom ni le prix (§3.2 du plan de refonte). Verticale au-delà.
 */
export type ProductCardLayout = "stack" | "adaptive";

/** Classes appliquées sous 400 px en disposition `adaptive` (même seuil que `grid-products`). */
const list = {
  card: "max-[400px]:grid max-[400px]:min-h-0 max-[400px]:grid-cols-[88px_minmax(0,1fr)] max-[400px]:content-start max-[400px]:gap-x-4 max-[400px]:p-4",
  right: "max-[400px]:col-start-2",
  visual:
    "max-[400px]:col-start-1 max-[400px]:row-span-4 max-[400px]:row-start-1 max-[400px]:m-0 max-[400px]:h-[88px] max-[400px]:self-center",
  name: "max-[400px]:mt-1 max-[400px]:text-[17px]",
  tagline: "max-[400px]:hidden",
  price: "max-[400px]:mt-1",
};

/**
 * Carte produit (maquette : `.card`), composant serveur : marque, badge « Nouveau » (isNew),
 * visuel, nom, accroche, prix minimal (« Dès » seulement si les variantes ont plusieurs prix,
 * comme sur la fiche), « Acheter » vers la fiche (le choix de la variante se fait sur la fiche).
 * « + Comparer » arrive à l'étape 5. Le visuel est décoratif : le titre nomme déjà le produit, et
 * « Acheter » porte son nom (WCAG 2.4.4).
 */
export function ProductCard({
  product,
  layout = "stack",
}: {
  product: ProductCardData;
  layout?: ProductCardLayout;
}) {
  const adaptive = layout === "adaptive";
  return (
    <article
      data-product-card={product.code}
      data-brand={product.brand_slug}
      className={clsx(
        "flex h-full min-h-[470px] w-full min-w-0 flex-col rounded-card bg-brand-ground p-6 transition-[translate,box-shadow] duration-500 ease-out state-hover:-translate-y-2 state-hover:shadow-card",
        adaptive && list.card,
      )}
    >
      <div
        className={clsx("flex min-h-6 items-center justify-between gap-2", adaptive && list.right)}
      >
        <span data-card-brand="" className="text-meta text-brand-ink">
          {product.brand_name}
        </span>
        {product.is_new ? <NewBadge /> : null}
      </div>
      <ProductVisual
        product={product}
        decorative
        sizes={adaptive ? "(max-width: 399px) 88px, 220px" : "220px"}
        className={clsx(
          "mt-3.5 mb-1.5 flex h-[220px] w-full items-center justify-center",
          adaptive && list.visual,
        )}
      />
      <h3
        className={clsx(
          "mt-2 mb-1.5 font-display text-[21px] leading-[1.15] font-bold",
          adaptive && list.right,
          adaptive && list.name,
        )}
      >
        {product.name}
      </h3>
      <p
        className={clsx(
          "flex-1 text-[14.5px] leading-[1.45] text-muted-strong",
          adaptive && list.tagline,
        )}
      >
        {product.tagline}
      </p>
      <p
        className={clsx(
          "mt-3.5 mb-3 text-[15px] font-semibold",
          adaptive && list.right,
          adaptive && list.price,
        )}
      >
        {product.min_price_fcfa !== null ? (
          <Price
            amount={[product.min_price_fcfa, product.max_price_fcfa ?? product.min_price_fcfa]}
          />
        ) : (
          "Prix indisponible"
        )}
      </p>
      <Button
        href={productHref(product.slug)}
        size="md"
        className={clsx("w-full", adaptive && list.right)}
        aria-label={`Acheter ${product.name}`}
      >
        Acheter
      </Button>
    </article>
  );
}
