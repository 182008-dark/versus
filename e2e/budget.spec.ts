import { expect, test, type Page } from "@playwright/test";

/**
 * Budgets de l'étape 3 (§4.5 et §7.1 du plan), mesurés sur `next build && next start`
 * (compression gzip du serveur Next), dans un contexte neuf et sans cache.
 */
const MAX_JAVASCRIPT_BYTES = 150 * 1024;
const MAX_TOTAL_BYTES = 1024 * 1024;

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
  await page.waitForLoadState("networkidle");
}

/** Somme des `transferSize` des scripts de l'application, préchargements de liens compris. */
async function getJavaScriptTransferSize(page: Page) {
  return page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((entry) => entry.name.includes("/_next/static/") && entry.name.endsWith(".js"))
      .reduce((sum, entry) => sum + (entry as PerformanceResourceTiming).transferSize, 0),
  );
}

test.describe("budgets (accueil, fiche, pages marque)", () => {
  for (const path of ["/", "/produit/iphone-18-pro", "/marques/samsung"]) {
    test(`le JavaScript compressé de ${path} reste sous 150 Ko`, async ({ page }) => {
      await loadWholePage(page, path);
      const bytes = await getJavaScriptTransferSize(page);
      expect(bytes, `JavaScript transféré sur ${path} : ${bytes} octets`).toBeLessThan(
        MAX_JAVASCRIPT_BYTES,
      );
    });
  }

  for (const path of ["/", "/marques/samsung", "/marques/xiaomi"]) {
    test(`les ressources et le document de ${path} restent sous 1 Mo`, async ({ page }) => {
      await loadWholePage(page, path);
      const { resources, document } = await page.evaluate(() => ({
        resources: performance
          .getEntriesByType("resource")
          .reduce((sum, entry) => sum + (entry as PerformanceResourceTiming).transferSize, 0),
        document: (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming)
          .transferSize,
      }));
      expect(document, "le document HTML est mesuré").toBeGreaterThan(0);
      const total = resources + document;
      expect(total, `Transfert total : ${total} octets (document ${document})`).toBeLessThan(
        MAX_TOTAL_BYTES,
      );
    });
  }
});
