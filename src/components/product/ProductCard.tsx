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
 * Disposition de la carte :
 * - `stack` (défaut) : carte verticale, partout où elle est déjà employée (rail, boutique) ;
 * - `adaptive` : dans une grille `grid-products` (pages marque, §3.2 du plan de refonte) :
 *   - sous 400 px, **en liste** (photo à gauche ; marque, nom, catégorie, coloris, prix et action
 *     à droite), pour qu'un Android de 360 px ne coupe ni le nom ni le prix ;
 *   - de 400 à 640 px (2 colonnes étroites, Android de 412 px), **compacte** : accroche masquée,
 *     photo de 120 px, nom en 17 px (2 lignes au plus) ;
 *   - verticale au-delà ; avec `featured`, grande carte horizontale dès 901 px (produit phare).
 */
export type ProductCardLayout = "stack" | "adaptive";

/**
 * Carte produit (maquette : `.card`), composant serveur : marque, badge « Nouveau » (isNew),
 * visuel, nom, catégorie et coloris (s'ils sont fournis), accroche, prix minimal (« Dès »
 * seulement si les variantes ont plusieurs prix, comme sur la fiche), puis un bouton vers la
 * fiche (le choix de la variante se fait sur la fiche).
 *
 * Libellé du bouton : « Voir le produit » en disposition `adaptive` (règle 4 de la direction : pas
 * de « Acheter » tant qu'il n'y a pas de panier) ; la disposition `stack` (rail, boutique) garde
 * « Acheter » jusqu'à sa refonte (lots 4 et 5, écart E27). Le nom accessible cite le produit
 * (WCAG 2.4.4) et commence par le texte visible (WCAG 2.5.3). Le visuel est décoratif.
 */
export function ProductCard({
  product,
  layout = "stack",
  category,
  swatches,
  featured = false,
}: {
  product: ProductCardData;
  layout?: ProductCardLayout;
  /** Catégorie lisible (« Écouteurs »), affichée sous le nom. */
  category?: string;
  /** Coloris du produit, en pastilles sous le nom. */
  swatches?: readonly ColorSwatch[];
  /** Produit phare de sa section : grande carte dès 901 px (disposition `adaptive`). */
  featured?: boolean;
}) {
  const adaptive = layout === "adaptive";
  const big = adaptive && featured;
  const action = adaptive ? "Voir le produit" : "Acheter";
  const hasMeta = Boolean(category) || (swatches?.length ?? 0) > 0;

  return (
    <article
      data-product-card={product.code}
      data-brand={product.brand_slug}
      data-featured={big ? "" : undefined}
      className={clsx(
        "flex h-full min-h-[470px] w-full min-w-0 flex-col rounded-card bg-brand-ground p-6 transition-[translate,box-shadow] duration-500 ease-out state-hover:-translate-y-2 state-hover:shadow-card",
        adaptive && [compact.card, list.card],
        big && featuredClasses.card,
      )}
    >
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
          />
        ) : (
          "Prix indisponible"
        )}
      </p>
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
    </article>
  );
}
