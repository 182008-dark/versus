import clsx from "clsx";
import Link from "next/link";
import { productHref } from "@/config/site";
import type { ColorSwatch } from "@/lib/catalog/brand-page";
import { compact, featured as featuredClasses, list } from "./product-card-layout";
import { ProductCardContent, type ProductCardData } from "./ProductCardContent";

export type { ProductCardData };

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
 * Libellé du bouton : « Voir le produit » en disposition `adaptive` (règle 4 de la direction) ;
 * avec `wholeCard` (rail de l'accueil), toute la carte est le lien (`next/link`), sans bouton ;
 * la disposition `stack` de la boutique garde « Acheter » jusqu'au lot 5 (écart E27).
 * Le nom accessible cite le produit
 * (WCAG 2.4.4) et commence par le texte visible (WCAG 2.5.3). Le visuel est décoratif.
 */
export function ProductCard({
  product,
  layout = "stack",
  category,
  swatches,
  featured = false,
  wholeCard = false,
}: {
  product: ProductCardData;
  layout?: ProductCardLayout;
  /** Catégorie lisible (« Écouteurs »), affichée sous le nom. */
  category?: string;
  /** Coloris du produit, en pastilles sous le nom. */
  swatches?: readonly ColorSwatch[];
  /** Produit phare de sa section : grande carte dès 901 px (disposition `adaptive`). */
  featured?: boolean;
  /** Carte entière cliquable, utilisée dans le rail de l'accueil. */
  wholeCard?: boolean;
}) {
  const adaptive = layout === "adaptive";
  const big = adaptive && featured;
  const content = {
    product,
    adaptive,
    big,
    hasMeta: Boolean(category) || (swatches?.length ?? 0) > 0,
    category,
    swatches,
  };

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
      {wholeCard ? (
        <Link className="product-card-whole-link" href={productHref(product.slug)}>
          <ProductCardContent {...content} />
        </Link>
      ) : (
        <ProductCardContent {...content} action={adaptive ? "Voir le produit" : "Acheter"} />
      )}
    </article>
  );
}
