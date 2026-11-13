import { Icon } from "@/components/ui/Icon";
import { routeFor } from "@/config/site";
import type { CatalogCategory } from "@/lib/catalog/types";

const icons = {
  smartphones: "smartphone",
  ecouteurs: "buds",
  montres: "watch",
  bracelets: "band",
} as const;

export function CategoryNav({ categories }: { categories: readonly CatalogCategory[] }) {
  const shop = routeFor("boutique");
  if (!shop) return null;

  return (
    <nav aria-label="Catégories" className="category-nav wrap">
      {categories.map((category) => (
        <a key={category.slug} href={`${shop}#${category.slug}`} className="category-link reveal">
          <span className="category-icon">
            <Icon name={icons[category.slug]} />
          </span>
          {category.name}
        </a>
      ))}
      <a href="#comparer" className="category-link reveal">
        <span className="category-icon">
          <Icon name="compare" />
        </span>
        Comparer
      </a>
    </nav>
  );
}
