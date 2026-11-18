import type { Brand } from "@/lib/brand-themes";
import type { CartLineMedia } from "@/lib/cart/quote";

/**
 * Vignette de 64 px d'une ligne du panier, sur le fond pastel de la marque. Décorative : le nom
 * du produit suit. L'image optimisée (`src`, `srcSet`) est préparée par la Server Action
 * `priceCart` avec `getImageProps` : l'optimiseur de `next/image` reste hors du JavaScript de la
 * page. Sans réponse du serveur (ou sans visuel), le fond pastel seul.
 */
export function LineThumb({
  brand,
  media,
}: {
  brand: Brand | null | undefined;
  media: CartLineMedia | undefined;
}) {
  return (
    <div
      data-brand={brand ?? undefined}
      className="grid size-16 shrink-0 place-items-center rounded-control bg-brand-ground p-1.5"
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
    </div>
  );
}
