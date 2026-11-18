import type { ReactNode } from "react";
import { ProductVisual, type VisualProduct } from "@/components/product/ProductVisual";
import type { Brand } from "@/lib/brand-themes";

/** Place des trois vedettes en éventail : la première au centre, devant les deux autres. */
const fan = [
  "z-10 h-[150px] w-[38%] sm:h-[230px] lg:h-[300px]",
  "h-[110px] w-[30%] -rotate-6 translate-y-2 sm:h-[170px] lg:h-[220px]",
  "h-[110px] w-[30%] rotate-6 translate-y-2 sm:h-[170px] lg:h-[220px]",
];
/** Ordre d'affichage : gauche, centre, droite (le DOM garde la vedette en premier). */
const order = ["order-2", "order-1", "order-3"];

/**
 * Bandeau d'une page marque (§3.2 du plan de refonte), composant serveur : fond pastel de la
 * marque, filet de 3 px à sa couleur (décoratif), nom en très grand, phrase de gamme, résumé
 * calculé (« 10 produits · de … à … FCFA »), paiements simulés, mention « Prix indicatifs,
 * boutique fictive » (règle anti-imitation : jamais de logo ni de police de marque), trois
 * produits vedettes en éventail et le sélecteur de marque.
 *
 * Seule image prioritaire de la page : la première vedette (préchargée, `fetchpriority=high`).
 */
export function BrandBanner({
  brand,
  name,
  tagline,
  summary,
  featured,
  switcher,
}: {
  brand: Brand;
  name: string;
  tagline: string;
  summary: string;
  featured: readonly VisualProduct[];
  switcher: ReactNode;
}) {
  return (
    <section
      aria-labelledby="marque-titre"
      data-brand={brand}
      className="relative overflow-hidden rounded-tile bg-brand-ground"
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand-mark" />
      <div className="grid gap-6 px-5 pt-9 pb-6 sm:px-10 sm:pt-12 sm:pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-10 lg:px-14 lg:py-14">
        <div className="min-w-0">
          <h1 id="marque-titre" className="text-display-brand text-brand-ink">
            {name}
          </h1>
          <p className="mt-4 max-w-[34ch] text-[length:var(--text-sub)] leading-snug text-ink">
            {tagline}
          </p>
          <p
            data-brand-summary=""
            className="mt-5 font-display text-lg leading-snug font-bold text-price tabular-nums sm:text-xl"
          >
            {summary}
          </p>
          <ul className="mt-3 space-y-1 text-sm text-muted-strong">
            <li>Paiement à la livraison · T-Money · Flooz (simulés)</li>
            <li>Prix indicatifs, boutique fictive</li>
          </ul>
          <div className="mt-6">{switcher}</div>
        </div>
        {featured.length > 0 ? (
          <div className="flex items-end justify-center gap-1 sm:gap-3">
            {featured.map((product, index) => (
              <ProductVisual
                key={product.code}
                product={product}
                decorative
                priority={index === 0}
                sizes={
                  index === 0
                    ? "(max-width: 640px) 38vw, (max-width: 1024px) 30vw, 220px"
                    : "(max-width: 640px) 30vw, 180px"
                }
                className={`flex items-end justify-center ${fan[index] ?? ""} ${order[index] ?? ""}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
