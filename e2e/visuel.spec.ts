import { expect, test } from "@playwright/test";

test("les visuels produits du hero et de la boutique sont chargés", async ({ page }) => {
  await page.goto("/");
  const heroImage = page.locator(".hero-slide-active [data-product='ip18'] img");
  await expect(heroImage).toBeVisible();
  await expect
    .poll(() => heroImage.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);

  await page.goto("/boutique");
  const images = page.locator("[data-product] img");
  await expect(images).toHaveCount(9);
  const height = await page.locator("body").evaluate((body) => body.scrollHeight);
  for (let y = 0; y < height; y += 650) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(100);
  }
  await expect
    .poll(() =>
      images.evaluateAll(
        (elements) =>
          elements.filter((element) => (element as HTMLImageElement).naturalWidth === 0).length,
      ),
    )
    .toBe(0);
  const missing = await images.evaluateAll((elements) =>
    elements
      .filter(
        (element) =>
          !(element as HTMLImageElement).complete ||
          (element as HTMLImageElement).naturalWidth === 0,
      )
      .map((element) => element.getAttribute("alt")),
  );
  expect(missing).toEqual([]);
});
