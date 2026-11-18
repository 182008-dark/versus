/**
 * Captures pleine page d'un lot de la refonte (avant / après), à 1440 × 900 et 390 × 844 px.
 *
 * Prérequis : le site tourne (`npm run build && npm run start`).
 * Usage : npm run capture:refonte -- <dossier de sortie relatif à la racine>
 *   ex. npm run capture:refonte -- docs/refonte/lot-2/avant
 *   SITE_URL  URL de base (défaut : http://localhost:3000)
 *   PAGES     pages capturées, séparées par des virgules (défaut : /styleguide,/,/boutique)
 *
 * Produit <dossier>/<page>-<largeur>.png (`accueil` pour `/`). Mouvement réduit (aucun défilement
 * automatique), polices chargées, images paresseuses déclenchées par un défilement complet.
 */
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "@playwright/test";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";
const PAGES = (process.env.PAGES ?? "/styleguide,/,/boutique").split(",");
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
] as const;

function fileName(path: string) {
  return path === "/" ? "accueil" : path.replace(/^\//, "").replace(/\//g, "-");
}

/** Fait défiler la page pour déclencher les images paresseuses, puis attend leur décodage. */
async function loadEverything(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight / 2;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, 0);
    await document.fonts.ready;
    // Une image paresseuse hors écran ne se décode jamais : délai de 3 s au plus.
    const decoded = Promise.all(
      [...document.images].map((img) => (img.complete ? null : img.decode().catch(() => null))),
    );
    await Promise.race([decoded, new Promise((resolve) => setTimeout(resolve, 3000))]);
  });
  await page.waitForTimeout(300);
}

async function main() {
  const target = process.argv[2];
  if (!target) throw new Error("Dossier de sortie manquant (ex. docs/refonte/lot-2/avant).");
  const outDir = join(ROOT, target);
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  try {
    for (const viewport of VIEWPORTS) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        reducedMotion: "reduce",
        locale: "fr-FR",
        timezoneId: "Africa/Lome",
      });
      for (const path of PAGES) {
        await page.goto(new URL(path, SITE_URL).href, { waitUntil: "load" });
        await loadEverything(page);
        const file = join(outDir, `${fileName(path)}-${viewport.name}.png`);
        await page.screenshot({ path: file, fullPage: true, animations: "disabled" });
        console.log(file);
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
