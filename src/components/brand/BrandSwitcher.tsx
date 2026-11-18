import clsx from "clsx";
import { BrandMark } from "@/components/ui/BrandMark";
import { VsMark } from "@/components/ui/VsMark";
import { brandHref } from "@/config/site";
import type { Brand } from "@/lib/brand-themes";

/** Classes appliquées sous 420 px (Android de 360 à 412 px). */
const compact = {
  list: "max-[420px]:gap-x-1",
  item: "max-[420px]:gap-1",
  current: "max-[420px]:px-2",
  other: "max-[420px]:px-0",
  vs: "max-[420px]:size-7 max-[420px]:text-[10px]",
  mark: "max-[420px]:gap-1.5 max-[420px]:text-[14px] max-[420px]:[&>[data-brand-dot]]:size-2",
};

/**
 * Sélecteur « Apple vs Samsung vs Xiaomi » du bandeau de marque (§3.2 et §4.7 du plan de
 * refonte), composant serveur. Les autres marques sont des liens (pastille de marque de 44 px) ;
 * la marque affichée est un simple texte encadré, sans `aria-current` (un seul par page, porté
 * par l'en-tête). Les médaillons « VS » sont décoratifs (`aria-hidden`).
 *
 * Sous 420 px (Android de 360 à 412 px), noms en 14 px, « VS » de 28 px, pastilles et espacements
 * resserrés : les trois marques et les deux « VS » tiennent sur une ligne dès 360 px, pour qu'un
 * « VS » ne commence jamais une ligne loin de la marque qui le précède. Chaque « VS » reste groupé
 * avec la marque qui le suit (repli sur 2 lignes à 320 px).
 */
export function BrandSwitcher({
  brands,
  current,
  className,
}: {
  brands: readonly { slug: Brand; name: string }[];
  current: Brand;
  className?: string;
}) {
  return (
    <nav aria-label="Changer de marque" className={className}>
      <ul className={clsx("flex flex-wrap items-center gap-x-2 gap-y-1", compact.list)}>
        {brands.map((brand, index) => {
          const href = brand.slug === current ? null : brandHref(brand.slug);
          return (
            <li key={brand.slug} className={clsx("flex items-center gap-2", compact.item)}>
              {index > 0 ? <VsMark size="sm" className={compact.vs} /> : null}
              <span
                className={clsx(
                  "inline-flex min-h-11 items-center rounded-full px-3",
                  brand.slug === current
                    ? ["border border-line-control bg-bg", compact.current]
                    : compact.other,
                )}
              >
                <BrandMark
                  brand={brand.slug}
                  size="lead"
                  href={href ?? undefined}
                  className={compact.mark}
                />
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
