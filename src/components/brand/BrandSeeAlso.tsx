import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import type { Brand } from "@/lib/brand-themes";

export type SeeAlsoLink = { slug: Brand; name: string; href: string; summary: string };

/**
 * « Voir aussi » (§3.2 du plan de refonte), composant serveur : les deux autres marques, avec
 * leur nombre de produits calculé (« Apple · 10 produits »). Fond pastel et filet de la marque,
 * jamais de couleur de marque en aplat ni pour une action.
 */
export function BrandSeeAlso({ links }: { links: readonly SeeAlsoLink[] }) {
  if (links.length === 0) return null;
  return (
    <nav aria-labelledby="voir-aussi-titre" className="pt-section">
      <h2 id="voir-aussi-titre" className="text-display-h2">
        Voir aussi
      </h2>
      <ul className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
        {links.map((link) => (
          <li key={link.slug}>
            <Link
              href={link.href}
              data-brand={link.slug}
              className="relative flex min-h-[88px] items-center justify-between gap-4 overflow-hidden rounded-card bg-brand-ground px-6 py-5 transition-shadow duration-(--dur-base) state-hover:shadow-card"
            >
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand-mark" />
              <span className="flex flex-col">
                <span className="font-display text-2xl leading-tight font-extrabold text-brand-ink">
                  {link.name}
                </span>
                <span className="text-sm text-muted-strong">{link.summary}</span>
              </span>
              <span className="text-brand-ink">
                <Arrow />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
