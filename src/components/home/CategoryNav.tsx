import { Icon, type IconName } from "@/components/ui/Icon";
import { routeFor } from "@/config/site";
import type { CatalogCategory, CategorySlug } from "@/lib/catalog/types";

const icons = {
  smartphones: "smartphone",
  ecouteurs: "buds",
  montres: "watch",
  bracelets: "band",
} as const satisfies Record<CategorySlug, IconName>;

/**
 * Pastilles de catégories de l'accueil (refonte, §3.1), composant serveur : « Smartphones 13 ·
 * Écouteurs 7 · Montres 7 · Bracelets 3 », comptes calculés à partir du catalogue. Elles défilent
 * horizontalement sur téléphone. Chaque cible passe par `routeFor()` (ancres de la boutique) ;
 * « Comparer » n'en fait plus partie (lien discret du hero).
 */
export function CategoryNav({
  categories,
  products,
}: {
  categories: readonly CatalogCategory[];
  products: readonly { category_slug: CategorySlug }[];
}) {
  const links = categories.flatMap((category) => {
    const href = routeFor(category.slug);
    if (!href) return [];
    return [
      {
        key: category.slug,
        label: category.name,
        count: products.filter((product) => product.category_slug === category.slug).length,
        icon: icons[category.slug] as IconName,
        href,
      },
    ];
  });

  if (links.length === 0) return null;

  return (
    <nav aria-label="Catégories" className="category-nav">
      <span className="category-nav-label">Parcourir</span>
      <div className="category-nav-links">
        {links.map((link) => (
          <a key={link.key} href={link.href} className="category-link reveal">
            <Icon name={link.icon} size={19} stroke={1.7} />
            <span>{link.label}</span>
            <span className="category-count">{link.count}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
