import { existsSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

/**
 * Régression visuelle de l'accueil (§4.6 et §7.1) : `toHaveScreenshot` pleine page à 1440 et
 * 390 px, animations coupées (mouvement réduit + `animations: "disabled"`), `VS_TODAY` fixé par
 * playwright.config.ts, polices chargées et toutes les images décodées.
 *
 * Références par plateforme : le rendu des polices diffère entre Windows et Linux, Playwright
 * suffixe donc chaque référence (`accueil-1440-chromium-win32.png`, `…-linux.png`). Une
 * plateforme sans référence est IGNORÉE (annotation explicite) au lieu d'échouer : la CI Linux
 * reste verte tant que ses références n'ont pas été générées. Procédure : docs/audits/visuel.md.
 * Seuil : 0,5 % de pixels différents au plus (anticrénelage), documenté au même endroit.
 */

const MAX_DIFF_PIXEL_RATIO = 0.005;

async function prepare(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  // Charge toutes les images (y compris paresseuses) et attend les polices.
  await page.evaluate(() => {
    for (const image of document.images) image.loading = "eager";
    return document.fonts.ready.then(() => undefined);
  });
  await expect
    .poll(() =>
      page.evaluate(() =>
        Array.from(document.images).every(
          (image) =>
            !image.checkVisibility({ visibilityProperty: true }) ||
            (image.complete && image.naturalWidth > 0),
        ),
      ),
    )
    .toBe(true);
  await page.waitForLoadState("networkidle");
}

for (const { name, width, height } of [
  { name: "accueil-1440.png", width: 1440, height: 900 },
  { name: "accueil-390.png", width: 390, height: 844 },
]) {
  test(`l'accueil à ${width} px est identique à la référence`, async ({ page }, testInfo) => {
    const reference = testInfo.snapshotPath(name, { kind: "screenshot" });
    test.skip(
      !existsSync(reference) && ["default", "none"].includes(testInfo.config.updateSnapshots),
      `Pas de référence pour ${process.platform} (${reference}) : voir docs/audits/visuel.md.`,
    );
    await page.setViewportSize({ width, height });
    await prepare(page);
    await expect(page).toHaveScreenshot(name, {
      fullPage: true,
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO,
      timeout: 15_000,
    });
  });
}

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
});
