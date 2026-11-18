import type { Brand } from "@/lib/brand-themes";
import type { CartLineMedia } from "@/lib/cart/quote";

/**
 * Vignette de 64 px d'une ligne du panier, sur le fond pastel de la marque. Décorative : le nom
 * du produit suit. L'image optimisée (`src`, `srcSet`) est préparée par la Server Action
 * `priceCart` avec `getImageProps` : l'optimiseur de `next/image` reste hors du JavaScript de la
 * page. Sans réponse du serveur (ou sans visuel), le fond pastel seul.
 * La photo est celle du produit, pas forcément celle du coloris choisi : la pastille du coloris
 * de la ligne (`swatch`, `color_hex` du devis) est posée dans un coin de la vignette. À l'étape 4,
 * une photo par variante (`product_images.variant_id`) pourra la remplacer.
 */
export function LineThumb({
  brand,
  media,
  swatch,
}: {
  brand: Brand | null | undefined;
  media: CartLineMedia | undefined;
  /** Teinte du coloris de la ligne (`color_hex`). */
  swatch?: string | null;
}) {
  return (
    <div
      data-brand={brand ?? undefined}
      className="relative grid size-16 shrink-0 place-items-center rounded-control bg-brand-ground p-1.5"
    >
      {media?.src ? (
        // eslint-disable-next-line @next/next/no-img-element -- image déjà optimisée par getImageProps (serveur)
        <img
          src={media.src}
          srcSet={media.srcSet ?? undefined}
          sizes="64px"
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain"
        />
      ) : null}
      {swatch ? (
        <span
          aria-hidden="true"
          data-testid="pastille-coloris"
          className="absolute right-1 bottom-1 size-4 rounded-full border-2 border-bg ring-1 ring-line-control"
          style={{ backgroundColor: swatch }}
        />
      ) : null}
    </div>
  );
}
