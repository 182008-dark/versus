import { getImageProps } from "next/image";
import type { CSSProperties } from "react";
import { preload } from "react-dom";
import type { CatalogProductRow } from "@/lib/catalog/types";
import { FallbackVisual } from "./FallbackVisual";

export type VisualProduct = Pick<
  CatalogProductRow,
  | "code"
  | "name"
  | "brand_slug"
  | "visual_kind"
  | "image_src"
  | "image_width"
  | "image_height"
  | "image_alt"
>;

/**
 * Visuel produit (§4.3), composant serveur, conteneur à hauteur fixée et `object-contain`.
 *
 * `getImageProps()` de next/image calcule `src`, `srcSet` (largeurs de next.config.ts) et les
 * attributs de chargement sur le serveur : on garde l'optimiseur et ses garde-fous sans le
 * composant client `<Image>`, dont le code s'ajoutait à chaque page (budget JavaScript, §7.1).
 * L'image prioritaire (LCP) est préchargée par `preload()` de React.
 *
 * - `decorative` : alternative vide quand un titre voisin nomme déjà le produit (cartes,
 *   tableau, cartes de marque) ; la fiche garde l'alternative complète.
 * - Image absente (LEFT JOIN de la vue `catalog_products`) : SVG de secours.
 */
export function ProductVisual({
  product,
  priority = false,
  decorative = false,
  sizes = "(max-width: 640px) 55vw, (max-width: 1024px) 35vw, 260px",
  className,
  style,
}: {
  product: VisualProduct;
  priority?: boolean;
  decorative?: boolean;
  sizes?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const alt = decorative ? "" : (product.image_alt ?? product.name);
  const { image_src: src, image_width: width, image_height: height } = product;

  let visual;
  if (src && width && height) {
    const { props } = getImageProps({
      src,
      width,
      height,
      alt,
      sizes,
      preload: priority,
      loading: priority ? "eager" : "lazy",
      className: "h-full w-full object-contain",
    });
    if (priority && props.srcSet) {
      preload(props.src, {
        as: "image",
        imageSrcSet: props.srcSet,
        imageSizes: props.sizes,
        fetchPriority: "high",
      });
    }
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- props de getImageProps (alt compris)
    visual = <img {...props} />;
  } else {
    visual = <FallbackVisual kind={product.visual_kind} brand={product.brand_slug} label={alt} />;
  }

  return (
    <div
      data-product={product.code}
      data-brand={product.brand_slug}
      className={className}
      style={style}
    >
      {visual}
    </div>
  );
}
