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
 * Navigation par catégories (maquette : `nav.cats`), composant serveur. Chaque cible passe par
 * `routeFor()` (table de l'étape 3) : catégories → `/boutique#<categorie>` puis
 * `/boutique/[categorie]` (4) ; « Comparer » → section de l'accueil puis `/comparer` (5) ;
 * « Aide au choix » masqué tant que le QuizTeaser l'est (5).
 */
export function CategoryNav({ categories }: { categories: readonly CatalogCategory[] }) {
  const links = [
    ...categories.map((category) => ({
      key: category.slug,
      label: category.name,
      icon: icons[category.slug] as IconName,
      href: routeFor(category.slug),
    })),
    {
      key: "comparer",
      label: "Comparer",
      icon: "compare" as const,
      href: routeFor("comparer") ?? routeFor("comparerAccueil"),
    },
    { key: "aide", label: "Aide au choix", icon: "help" as const, href: routeFor("aideAccueil") },
  ].flatMap((link) => (link.href ? [{ ...link, href: link.href }] : []));

  if (links.length === 0) return null;

  return (
    <nav aria-label="Catégories" className="category-nav">
      {links.map((link) => (
        <a key={link.key} href={link.href} className="category-link reveal">
          <span className="category-icon">
            <Icon name={link.icon} size={34} stroke={1.5} />
          </span>
          {link.label}
        </a>
      ))}
    </nav>
  );
}
