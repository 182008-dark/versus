import type { CatalogCategory, CatalogProduct, HomeCatalog, ProductVariant } from "./types";

export interface CatalogRepository {
  listProducts(): Promise<readonly CatalogProduct[]>;
  getProductBySlug(slug: string): Promise<CatalogProduct | null>;
  getHome(): Promise<HomeCatalog>;
  listBrands(): Promise<readonly { slug: string; name: string; tagline: string }[]>;
  listCategories(): Promise<readonly CatalogCategory[]>;
  getVariantsStock(productId: string): Promise<readonly ProductVariant[]>;
}
