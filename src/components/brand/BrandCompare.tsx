import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { VsMark } from "@/components/ui/VsMark";
import type { CompareShortcut } from "@/lib/catalog/brand-page";
import type { CatalogProductRow } from "@/lib/catalog/types";

type Compared = Pick<CatalogProductRow, "code" | "name" | "brand_name" | "brand_slug">;

function Side({ product }: { product: Compared }) {
  return (
    <span data-brand={product.brand_slug} className="flex min-w-0 flex-col">
      <span className="text-meta text-brand-ink">{product.brand_name}</span>
      <span className="font-display text-base leading-tight font-bold text-ink sm:text-lg">
        {product.name}
      </span>
    </span>
  );
}

/**
 * « Comparer avec » (§3.2 du plan de refonte), composant serveur : deux raccourcis vers le
 * comparateur (section de l'accueil tant que `/comparer` n'existe pas), un par autre marque,
 * avec les produits que ce comparateur oppose (`compareShortcuts`). Le médaillon « VS » est
 * décoratif : le nom du lien dit « … contre … ».
 */
export function BrandCompare({
  shortcuts,
  href,
}: {
  shortcuts: readonly CompareShortcut<Compared>[];
  href: string;
}) {
  if (shortcuts.length === 0) return null;
  return (
    <section aria-labelledby="comparer-avec-titre" className="pt-section">
      <h2 id="comparer-avec-titre" className="text-display-h2">
        Comparer avec
      </h2>
      <ul className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
        {shortcuts.map(({ mine, theirs }) => (
          <li key={`${mine.code}-${theirs.code}`}>
            <Link
              href={href}
              className="relative grid h-full min-h-11 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-3 rounded-card border border-line-soft bg-bg p-5 transition-shadow duration-(--dur-base) state-hover:shadow-card"
            >
              <Side product={mine} />
              <VsMark size="sm" />
              <span className="sr-only"> contre </span>
              <Side product={theirs} />
              <span className="col-span-3 inline-flex items-center justify-end gap-1.5 text-sm font-semibold text-accent-ink">
                Comparer <Arrow />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
