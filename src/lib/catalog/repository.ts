import type {
  CatalogBrand,
  CatalogCategory,
  CatalogProductRow,
  HomeCatalog,
  ProductDetail,
  ProductVariant,
} from "./types";

/**
 * Accès au catalogue (§3.3) : implémenté par `static-repository.ts` (étape 3), puis par Supabase
 * (étape 4). Les types suivent la vue `catalog_products` (`CatalogProductRow`) ; seule la fiche
 * charge le détail (variantes, specs, description).
 */
export interface CatalogRepository {
  listProducts(): Promise<readonly CatalogProductRow[]>;
  getProductBySlug(slug: string): Promise<ProductDetail | null>;
  getHome(): Promise<HomeCatalog>;
  listBrands(): Promise<readonly CatalogBrand[]>;
  listCategories(): Promise<readonly CatalogCategory[]>;
  getVariantsStock(productId: string): Promise<readonly ProductVariant[]>;
}
