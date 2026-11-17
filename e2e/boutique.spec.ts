import { expect, test } from "@playwright/test";
import { brands, products } from "../src/data/catalog";
import { brandNames, productCount } from "../src/lib/catalog/summary";

/** Catalogue de la refonte (lot 1) : 30 produits, 10 par marque, comptes calculés. */
test.describe("boutique", () => {
  test("affiche tout le catalogue, avec un compte calculé", async ({ page }) => {
    await page.goto("/boutique");
    await expect(page.locator("[data-product-card]")).toHaveCount(products.length);
    for (const brand of brands) {
      await expect(page.locator(`[data-product-card][data-brand="${brand.slug}"]`)).toHaveCount(
        products.filter((product) => product.brand_slug === brand.slug).length,
      );
    }
    await expect(page.locator("main h1 + p")).toContainText(
      `${productCount(products.length)} pour découvrir les univers ${brandNames(brands)}.`,
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      `Les ${productCount(products.length)} ${brandNames(brands)} de la boutique fictive VERSUS.`,
    );
  });

  test("chaque fiche produit répond", async ({ request }) => {
    for (const product of products) {
      const response = await request.get(`/produit/${product.slug}`);
      expect(response.status(), product.slug).toBe(200);
    }
  });

  test("les anciennes adresses Samsung redirigent vers les noms officiels", async ({ request }) => {
    for (const [from, to] of [
      ["/produit/galaxy-buds-4", "/produit/galaxy-buds4"],
      ["/produit/galaxy-watch-9", "/produit/galaxy-watch9"],
    ] as const) {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status(), from).toBe(308);
      expect(response.headers().location, from).toBe(to);
    }
  });
});
