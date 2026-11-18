import type { Brand } from "@/lib/brand-themes";
import { formatFCFA, formatFCFAParts } from "@/lib/format/fcfa";
import { productCount } from "./summary";
import type { CatalogBrand, CatalogCategory, CatalogProductRow, ProductVariant } from "./types";

/**
 * Données des pages marque (`/marques/[marque]`, refonte, lot 3) : fonctions pures, testées, qui
 * ne lisent que les lignes de la vue `catalog_products`. Tout ce que la page affiche (« 10
 * produits », fourchette de prix, sections, produits vedettes) est calculé ici, jamais écrit en
 * dur.
 */

type Priced = Pick<CatalogProductRow, "brand_slug" | "min_price_fcfa">;

/** Marque d'un slug d'adresse, ou `undefined` (la page répond alors « introuvable »). */
export function findBrand<T extends Pick<CatalogBrand, "slug">>(
  brands: readonly T[],
  slug: string,
): T | undefined {
  return brands.find((brand) => brand.slug === slug);
}

/** Les deux autres marques, dans l'ordre des marques (« Voir aussi », « Comparer avec »). */
export function otherBrands<T extends Pick<CatalogBrand, "slug">>(
  brands: readonly T[],
  brand: Brand,
): T[] {
  return brands.filter((other) => other.slug !== brand);
}

/**
 * Produits d'une marque, et d'elle seule, du haut de gamme au moins cher (prix d'entrée
 * décroissant ; un produit sans prix passe en dernier). Ne modifie pas la liste reçue.
 */
export function productsOfBrand<T extends Priced>(products: readonly T[], brand: Brand): T[] {
  return products
    .filter((product) => product.brand_slug === brand)
    .toSorted((a, b) => (b.min_price_fcfa ?? -1) - (a.min_price_fcfa ?? -1));
}

export type CategoryGroup<T> = { category: CatalogCategory; products: T[] };

/**
 * Une section par catégorie, dans l'ordre des catégories (`position`). Une catégorie vide est
 * masquée : Apple n'a pas de bracelets. L'ordre des produits reçus est conservé.
 */
export function groupByCategory<T extends Pick<CatalogProductRow, "category_slug">>(
  products: readonly T[],
  categories: readonly CatalogCategory[],
): CategoryGroup<T>[] {
  return categories
    .toSorted((a, b) => a.position - b.position)
    .flatMap((category) => {
      const items = products.filter((product) => product.category_slug === category.slug);
      return items.length > 0 ? [{ category, products: items }] : [];
    });
}

export type PriceSpan = { min: number; max: number };

/** Fourchette des prix d'entrée (`min_price_fcfa`), ou `null` sans aucun prix. */
export function priceSpan(products: readonly Pick<Priced, "min_price_fcfa">[]): PriceSpan | null {
  const prices = products.flatMap((product) =>
    product.min_price_fcfa === null ? [] : [product.min_price_fcfa],
  );
  return prices.length > 0 ? { min: Math.min(...prices), max: Math.max(...prices) } : null;
}

/** « 10 produits · de 46 000 à 1 311 000 FCFA » (espaces insécables de `formatFCFA`). */
export function brandRangeLabel(count: number, span: PriceSpan | null): string {
  const label = productCount(count);
  if (!span) return label;
  if (span.min === span.max) return `${label} · ${formatFCFA(span.min)}`;
  return `${label} · de ${formatFCFAParts(span.min).amount} à ${formatFCFA(span.max)}`;
}

/**
 * Trois produits vedettes du bandeau : le phare (premier produit) de chaque section, puis, s'il
 * y a moins de trois sections, les produits suivants dans l'ordre de la page.
 */
export function featuredProducts<T>(groups: readonly CategoryGroup<T>[], count = 3): T[] {
  const leaders = groups.map((group) => group.products[0]!);
  const rest = groups.flatMap((group) => group.products.slice(1));
  return [...leaders, ...rest].slice(0, count);
}

type Comparable = Pick<CatalogProductRow, "brand_slug" | "compare_group">;

export type CompareShortcut<T> = { mine: T; theirs: T };

/**
 * « Comparer avec » : pour chaque autre marque, le produit de la marque et celui de l'autre
 * dans la première famille du comparateur de l'accueil où les deux figurent (produits de
 * `home_slots`, dans leur ordre). Une marque absente du comparateur est passée.
 */
export function compareShortcuts<T extends Comparable>(
  entries: readonly T[],
  brand: Brand,
  others: readonly Brand[],
): CompareShortcut<T>[] {
  return others.flatMap((other) => {
    for (const mine of entries.filter((entry) => entry.brand_slug === brand)) {
      const theirs = entries.find(
        (entry) => entry.brand_slug === other && entry.compare_group === mine.compare_group,
      );
      if (theirs) return [{ mine, theirs }];
    }
    return [];
  });
}

export type ColorSwatch = { slug: string; name: string; hex: string | null };

type Colored = Pick<
  ProductVariant,
  "color_slug" | "color_name" | "color_hex" | "storage_gb" | "size_mm" | "is_active" | "position"
>;

/**
 * Nom du coloris seul, sans la capacité ni la taille que porte le libellé de la variante
 * (« Noir · 256 Go » → « Noir », « 46 mm · Argent » → « Argent »).
 */
function colorOnly(variant: Colored): string {
  const parts = variant.color_name.split(" · ");
  if (variant.storage_gb !== null && parts.length > 1) parts.pop();
  if (variant.size_mm !== null && parts.length > 1) parts.shift();
  return parts.join(" · ");
}

/**
 * Coloris d'un produit pour les pastilles des cartes (§3.2 : liste mobile « nom, catégorie,
 * coloris et prix ») : un par `color_slug`, variantes actives seulement, dans l'ordre des
 * variantes.
 */
export function colorSwatches(variants: readonly Colored[]): ColorSwatch[] {
  const seen = new Map<string, ColorSwatch>();
  for (const variant of variants.toSorted((a, b) => a.position - b.position)) {
    if (!variant.is_active || seen.has(variant.color_slug)) continue;
    seen.set(variant.color_slug, {
      slug: variant.color_slug,
      name: colorOnly(variant),
      hex: variant.color_hex,
    });
  }
  return [...seen.values()];
}

/**
 * Vignettes d'une carte « Parcourir par marque » de l'accueil (refonte, §3.1) : le produit le plus
 * cher de chaque catégorie de la marque, dans l'ordre des catégories, sans les produits déjà mis
 * en avant plus haut sur la page (`exclude` : hero et tuiles). Calculé, jamais écrit en dur.
 */
export function brandShowcase<T extends Priced & Pick<CatalogProductRow, "code" | "category_slug">>(
  products: readonly T[],
  categories: readonly CatalogCategory[],
  brand: Brand,
  exclude: ReadonlySet<string>,
  count = 3,
): T[] {
  const candidates = productsOfBrand(products, brand).filter(
    (product) => !exclude.has(product.code),
  );
  return groupByCategory(candidates, categories)
    .map((group) => group.products[0]!)
    .slice(0, count);
}
