/**
 * Captures du gabarit implémenté (étape 2), à comparer aux captures de la maquette
 * (docs/maquette/captures/{1440,390}/01-en-tete.png et 11-pied-de-page.png).
 *
 * Prérequis : le site tourne (`npm run build && npm run start`, ou `npm run dev`).
 * Usage : npm run capture:gabarit
 *   SITE_URL  URL de base (défaut : http://localhost:3000)
 *   PAGE      page capturée (défaut : /mentions-legales)
 *
 * Produit, dans docs/maquette/implementation/ :
 *   <largeur>/01-en-tete.png        bandeau fictif et en-tête ;
 *   <largeur>/01-menu-mobile.png    menu mobile ouvert (390 px seulement) ;
 *   <largeur>/11-pied-de-page.png   pied de page ;
 *   <largeur>/pleine-page.png       la page entière.
 */
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "@playwright/test";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";
const PAGE = process.env.PAGE ?? "/mentions-legales";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "docs", "maquette", "implementation");

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
] as const;

async function captureUnion(page: Page, selectors: string[], path: string) {
  const box = await page.evaluate((sels) => {
    const rects = sels
      .map((s) => document.querySelector(s))
      .filter((e): e is Element => e !== null)
      .map((e) => e.getBoundingClientRect());
    const top = Math.min(...rects.map((r) => r.top)) + window.scrollY;
    const bottom = Math.max(...rects.map((r) => r.bottom)) + window.scrollY;
    return {
      x: 0,
      y: Math.floor(top),
      width: document.documentElement.clientWidth,
      height: Math.ceil(bottom - top),
    };
  }, selectors);
  await page.screenshot({ path, clip: box, fullPage: true });
}

async function main() {
  const browser = await chromium.launch();
  try {
    for (const viewport of VIEWPORTS) {
      const dir = join(OUT_DIR, viewport.name);
      await mkdir(dir, { recursive: true });
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        reducedMotion: "reduce",
      });
      await page.goto(new URL(PAGE, SITE_URL).href, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      // L'en-tête collant est rendu statique pour ne pas recouvrir les autres captures.
      await page.addStyleTag({ content: "header { position: relative !important; }" });

      await captureUnion(
        page,
        ["body > div:has(> p > strong)", "header"],
        join(dir, "01-en-tete.png"),
      );
      await captureUnion(page, ["footer"], join(dir, "11-pied-de-page.png"));
      await page.screenshot({ path: join(dir, "pleine-page.png"), fullPage: true });

      if (viewport.width < 901) {
        await page.getByRole("button", { name: "Menu", exact: true }).click();
        await page.waitForTimeout(200);
        await page.screenshot({ path: join(dir, "01-menu-mobile.png") });
      }
      await page.close();
      console.log(`Captures ${viewport.name} px : ${dir}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
