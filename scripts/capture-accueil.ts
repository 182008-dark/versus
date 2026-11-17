/**
 * Captures de l'accueil implémenté (étape 3), section par section, à comparer aux captures de
 * la maquette (docs/maquette/captures/{1440,390}/NN-<section>.png), avec les mêmes numéros.
 *
 * Prérequis : le site tourne (`npm run build && npm run start`, avec VS_TODAY=2026-11-12).
 * Usage : npm run capture:accueil
 *   SITE_URL  URL de base (défaut : http://localhost:3000)
 *
 * Produit, dans docs/maquette/implementation/<largeur>/ :
 *   NN-<section>.png  une capture recadrée par section (02-hero … 10-reassurance) ;
 *   accueil.png       la page entière.
 *
 * Choix : mouvement réduit (pas de défilement automatique, première diapositive), apparitions
 * au défilement figées dans leur état final, en-tête rendu statique pour ne pas recouvrir le
 * haut des sections.
 */
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "@playwright/test";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "docs", "maquette", "implementation");

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
] as const;

/** Sections de l'accueil, numérotées comme celles de la maquette (05 et 09 : non affichées). */
const SECTIONS = [
  { file: "02-hero", selector: ".hero-carousel" },
  { file: "03-categories", selector: "nav.category-nav" },
  { file: "04-tuiles", selector: ".promo-grid" },
  { file: "06-nouveautes", selector: "#nouveautes" },
  { file: "07-marques", selector: "#marques" },
  { file: "08-comparateur", selector: "#comparer" },
  { file: "10-reassurance", selector: "section[aria-labelledby='engagements-titre']" },
] as const;

const CAPTURE_CSS = `
  .reveal, .zoom, .rise { animation: none !important; opacity: 1 !important; }
  header { position: relative !important; }
`;

async function captureSection(page: Page, selector: string, path: string) {
  const box = await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {
      x: 0,
      y: Math.floor(rect.top + window.scrollY),
      width: document.documentElement.clientWidth,
      height: Math.ceil(rect.height),
    };
  }, selector);
  if (!box) throw new Error(`Section introuvable : ${selector}`);
  await page.screenshot({ path, clip: box, fullPage: true, animations: "disabled" });
}

async function main() {
  const browser = await chromium.launch();
  try {
    for (const viewport of VIEWPORTS) {
      const directory = join(OUT_DIR, viewport.name);
      await mkdir(directory, { recursive: true });
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        reducedMotion: "reduce",
      });
      await page.goto(new URL("/", SITE_URL).href, { waitUntil: "networkidle" });
      await page.addStyleTag({ content: CAPTURE_CSS });
      await page.evaluate(async () => {
        await document.fonts.ready;
        for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 60));
        }
        window.scrollTo(0, 0);
      });
      // Les images paresseuses des diapositives cachées ne se chargent jamais : on attend
      // seulement la fin du réseau.
      await page.waitForLoadState("networkidle");
      for (const section of SECTIONS) {
        await captureSection(page, section.selector, join(directory, `${section.file}.png`));
      }
      await page.screenshot({
        path: join(directory, "accueil.png"),
        fullPage: true,
        animations: "disabled",
      });
      await page.close();
      console.log(`Captures de l'accueil ${viewport.name} px : ${directory}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
