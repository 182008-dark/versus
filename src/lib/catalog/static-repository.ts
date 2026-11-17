import "server-only";
import { brands, categories, homeSlots, products } from "@/data/catalog";
import type { CatalogRepository } from "./repository";
import type { CatalogProductRow, HomeCatalog, HomeEntry, HomeSlotKind } from "./types";

const byCode = new Map(products.map((product) => [product.code, product]));

/** Projection d'une fiche sur les colonnes de la vue `catalog_products`. */
function toRow({
  description: _description,
  variants: _variants,
  specs: _specs,
  ...row
}: (typeof products)[number]): CatalogProductRow {
  void _description;
  void _variants;
  void _specs;
  return row;
}

function slotEntries(slot: HomeSlotKind): HomeEntry[] {
  return homeSlots
    .filter((entry) => entry.slot === slot)
    .toSorted((a, b) => a.position - b.position)
    .flatMap(({ product_code, slot: _slot, ...entry }) => {
      void _slot;
      const product = byCode.get(product_code);
      return product ? [{ ...entry, product }] : [];
    });
}

export const staticCatalogRepository: CatalogRepository = {
  async listProducts() {
    return products.map(toRow);
  },
  async getProductBySlug(slug) {
    return products.find((product) => product.slug === slug) ?? null;
  },
  async getHome(): Promise<HomeCatalog> {
    return {
      hero: slotEntries("hero"),
      tile: slotEntries("tile"),
      rail: slotEntries("rail"),
      compare: slotEntries("compare"),
    };
  },
  async listBrands() {
    return brands.toSorted((a, b) => a.position - b.position);
  },
  async listCategories() {
    return categories;
  },
  async getVariantsStock(productId) {
    return products.find((product) => product.id === productId)?.variants ?? [];
  },
};
