import clsx from "clsx";
import { BrandMark } from "@/components/ui/BrandMark";
import { VsMark } from "@/components/ui/VsMark";
import { brandHref } from "@/config/site";
import type { Brand } from "@/lib/brand-themes";

/**
 * Sélecteur « Apple vs Samsung vs Xiaomi » du bandeau de marque (§3.2 et §4.7 du plan de
 * refonte), composant serveur. Les autres marques sont des liens (pastille de marque de 44 px) ;
 * la marque affichée est un simple texte encadré, sans `aria-current` (un seul par page, porté
 * par l'en-tête). Les médaillons « VS » sont décoratifs (`aria-hidden`).
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
      <ul className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {brands.map((brand, index) => {
          const href = brand.slug === current ? null : brandHref(brand.slug);
          return (
            <li key={brand.slug} className="flex items-center gap-2">
              {index > 0 ? <VsMark size="sm" /> : null}
              <span
                className={clsx(
                  "inline-flex min-h-11 items-center rounded-full px-3",
                  brand.slug === current && "border border-line-control bg-bg",
                )}
              >
                <BrandMark brand={brand.slug} size="lead" href={href ?? undefined} />
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
