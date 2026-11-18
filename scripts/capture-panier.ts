/**
 * Captures du panier (étape 5) à 1440 × 900 et 390 × 844 px, dans docs/panier/ :
 * - `fiche-variante-<largeur>.png` : fiche de l'iPhone 18 Pro, variante Argent 256 Go choisie et
 *   ajoutée (annonce visible) ;
 * - `tiroir-<largeur>.png` : mini-panier ouvert depuis l'en-tête (deux articles) ;
 * - `panier-rempli-<largeur>.png` : page /panier, zone Lomé ;
 * - `panier-vide-<largeur>.png` : page /panier sans article.
 *
 * Prérequis : le site tourne (`npm run build && npm run start`).
 * Usage : npm run capture:panier   (SITE_URL : URL de base, défaut http://localhost:3000)
 * Mouvement réduit, polices chargées ; le panier est déposé dans `localStorage` comme le ferait
 * le site (SKU et quantités seulement).
 */
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "@playwright/test";
import { CART_STORAGE_KEY } from "../src/lib/cart/storage";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "docs", "panier");

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
] as const;

const FILLED = {
  version: 1,
  lines: [
    { sku: "IP18-ARG-256", qty: 1 },
    { sku: "AP5-BLA", qty: 2 },
  ],
  zone: "lome",
};

async function seed(page: Page, cart: unknown) {
  await page.goto(new URL("/mentions-legales", SITE_URL).href);
  await page.evaluate(([key, value]) => window.localStorage.setItem(key, value), [
    CART_STORAGE_KEY,
    JSON.stringify(cart),
  ] as const);
}

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
}

async function shoot(page: Page, name: string, fullPage = true) {
  if (fullPage) {
    // Pleine page : en haut de page et sans focus (en-tête collant et lien d'évitement à leur place).
    await page.evaluate(() => {
      (document.activeElement as HTMLElement | null)?.blur();
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(200);
  }
  const file = join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage, animations: "disabled" });
  console.log(file);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        reducedMotion: "reduce",
        locale: "fr-FR",
        timezoneId: "Africa/Lome",
      });
      const page = await context.newPage();

      // Fiche : variante choisie puis ajoutée.
      await page.goto(new URL("/produit/iphone-18-pro", SITE_URL).href);
      await page.getByRole("radio", { name: /Argent/ }).check();
      await page.getByRole("button", { name: /^Ajouter au panier/ }).click();
      await page.getByRole("status").filter({ hasText: "ajouté" }).waitFor();
      await settle(page);
      await shoot(page, `fiche-variante-${viewport.name}`);

      // Tiroir ouvert (capture de l'écran visible : le tiroir est une boîte modale).
      await seed(page, FILLED);
      await page.goto(new URL("/", SITE_URL).href);
      await page.getByRole("button", { name: /^Panier, 3 articles/ }).click();
      const dialog = page.getByRole("dialog", { name: "Votre panier" });
      await dialog.getByTestId("totaux").and(page.locator("[aria-busy=false]")).waitFor();
      await settle(page);
      await shoot(page, `tiroir-${viewport.name}`, false);

      // Page panier remplie, puis vide.
      await page.goto(new URL("/panier", SITE_URL).href);
      await page.getByTestId("totaux").and(page.locator("[aria-busy=false]")).waitFor();
      await settle(page);
      await shoot(page, `panier-rempli-${viewport.name}`);
      await seed(page, { version: 1, lines: [], zone: null });
      await page.goto(new URL("/panier", SITE_URL).href);
      await page.getByText("Votre panier est vide.").waitFor();
      await settle(page);
      await shoot(page, `panier-vide-${viewport.name}`);

      await context.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
