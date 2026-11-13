import { expect, test, type Page } from "@playwright/test";

const MAX_JAVASCRIPT_BYTES = 180 * 1024;

async function loadWholePage(page: Page, path = "/") {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  const height = await page.locator("body").evaluate((body) => body.scrollHeight);
  for (let y = 0; y < height; y += 700) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(20);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(250);
}

async function getJavaScriptTransferSize(page: Page) {
  return page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((entry) => entry.name.includes("/_next/static/") && entry.name.endsWith(".js"))
      .reduce((sum, entry) => sum + (entry as PerformanceResourceTiming).transferSize, 0),
  );
}

test.describe("budget d'accueil", () => {
  test("le JavaScript compressé de l'accueil reste sous 180 Ko", async ({ page }) => {
    await loadWholePage(page);
    const bytes = await getJavaScriptTransferSize(page);
    expect(bytes, `JavaScript transféré sur l'accueil : ${bytes} octets`).toBeLessThan(
      MAX_JAVASCRIPT_BYTES,
    );
  });

  test("le JavaScript compressé d'une fiche produit reste sous 180 Ko", async ({ page }) => {
    await loadWholePage(page, "/produit/iphone-18-pro");
    const bytes = await getJavaScriptTransferSize(page);
    expect(bytes, `JavaScript transféré sur la fiche : ${bytes} octets`).toBeLessThan(
      MAX_JAVASCRIPT_BYTES,
    );
  });

  test("les ressources et le document restent sous 1 Mo", async ({ page }) => {
    await loadWholePage(page);
    const bytes = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .reduce((sum, entry) => sum + (entry as PerformanceResourceTiming).transferSize, 0),
    );
    expect(bytes, `Transfert total : ${bytes} octets`).toBeLessThan(1024 * 1024);
  });
});
