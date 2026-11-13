import { cacheLife, cacheTag } from "next/cache";
import { staticCatalogRepository } from "./static-repository";

export async function getCatalog() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  return staticCatalogRepository.listProducts();
}

export async function getProduct(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", `product:${slug}`);
  return staticCatalogRepository.getProductBySlug(slug);
}

export async function getHome() {
  "use cache";
  cacheLife("hours");
  cacheTag("home");
  return staticCatalogRepository.getHome();
}

export async function getCategories() {
  "use cache";
  cacheLife("max");
  cacheTag("catalog");
  return staticCatalogRepository.listCategories();
}
