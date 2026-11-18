import type { CategoryGroup } from "@/lib/catalog/brand-page";

const pill =
  "relative inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-line-control bg-bg px-4 text-sm font-medium whitespace-nowrap state-hover:border-ink";

/**
 * Barre de catégories d'une page marque (§3.2 du plan de refonte), composant serveur : « Tout »
 * puis une pastille par catégorie **non vide**, avec le nombre de produits calculé. Ce sont des
 * liens vers les sections de la page (`#smartphones`…), donc jamais « page courante ».
 * Collante sous l'en-tête à partir de 901 px ; sur téléphone, elle défile horizontalement et ne
 * colle pas, pour ne pas manger l'écran.
 */
export function CategoryBar<T>({
  brandName,
  groups,
  total,
  allId,
  anchorPrefix = "",
}: {
  brandName: string;
  groups: readonly CategoryGroup<T>[];
  total: number;
  allId: string;
  /** Préfixe des ancres (styleguide, où les sections d'exemple ont leurs propres `id`). */
  anchorPrefix?: string;
}) {
  const links = [
    { id: allId, label: "Tout", count: total },
    ...groups.map((group) => ({
      id: group.category.slug,
      label: group.category.name,
      count: group.products.length,
    })),
  ];
  return (
    <nav
      aria-label={`Catégories ${brandName}`}
      className="z-40 -mx-gutter border-b border-line-soft bg-bg md:sticky md:top-[var(--header-height)]"
    >
      <ul className="relative flex gap-2 overflow-x-auto px-gutter py-3">
        {links.map((link) => (
          <li key={link.id}>
            <a href={`#${anchorPrefix}${link.id}`} className={pill}>
              {link.label}
              <span className="text-muted-strong tabular-nums">
                {link.count}
                <span className="sr-only">{link.count > 1 ? " produits" : " produit"}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
