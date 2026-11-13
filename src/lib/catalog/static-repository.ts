import "server-only";
import { categories, homeSlots, products } from "@/data/catalog";
import type { CatalogRepository } from "./repository";
import type { CatalogProduct, HomeCatalog } from "./types";

const byCode = new Map(products.map((product) => [product.code, product]));

function slotProducts(slot: (typeof homeSlots)[number]["slot"]): CatalogProduct[] {
  return homeSlots
    .filter((entry) => entry.slot === slot)
    .toSorted((a, b) => a.position - b.position)
    .flatMap((entry) => {
      const product = byCode.get(entry.product_code);
      return product ? [product] : [];
    });
}

export const staticCatalogRepository: CatalogRepository = {
  async listProducts() {
    return products;
  },
  async getProductBySlug(slug) {
    return products.find((product) => product.slug === slug) ?? null;
  },
  async getHome(): Promise<HomeCatalog> {
    return {
      hero: slotProducts("hero"),
      tiles: slotProducts("tile"),
      rail: slotProducts("rail"),
      compare: slotProducts("compare"),
    };
  },
  async listBrands() {
    return [
      { slug: "apple", name: "Apple", tagline: "iPhone, AirPods et Apple Watch." },
      { slug: "samsung", name: "Samsung", tagline: "Galaxy A, Galaxy Buds et Galaxy Watch." },
      { slug: "xiaomi", name: "Xiaomi", tagline: "Redmi Note, Redmi Watch et Smart Band." },
    ] as const;
  },
  async listCategories() {
    return categories;
  },
  async getVariantsStock(productId) {
    return products.find((product) => product.id === productId)?.variants ?? [];
  },
};
