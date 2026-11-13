/**
 * Captures de référence de la maquette validée (§4.6 et étape 1 du plan).
 *
 * Prérequis : la maquette est servie en HTTP (ses scripts sont bloqués en file://) :
 *   python -m http.server 4000 --directory "../Accueil VERSUS-html"
 *   (ou : npx serve -l 4000 "../Accueil VERSUS-html")
 *
 * Usage : npm run capture:maquette
 *   MAQUETTE_URL  URL de Main.dc.html (défaut : http://localhost:4000/Main.dc.html)
 *
 * Produit, dans docs/maquette/captures/ :
 *   <largeur>/NN-<section>.png  une capture par section, à 1440 et 390 px ;
 *   <largeur>/pleine-page.png   la page entière ;
 *   mesures.json                hauteur totale de la page et boîte de chaque section.
 *
 * Choix :
 * - pas de `reducedMotion` : dans la maquette, il masque le texte du hero ;
 * - on attend la fin des animations d'entrée du hero, puis on met le carrousel en pause
 *   sur la première diapositive ;
 * - les apparitions au défilement (`.reveal`, `.zoom`, `.rise`, animation-timeline: view())
 *   sont figées dans leur état final, sinon les sections hors de l'écran seraient transparentes ;
 * - la section épinglée « Smartphones » (`.pin`, 2 200 px, contenu collant animé par
 *   view-timeline) est capturée en défilant réellement jusqu'à 90 % de sa course, là où toutes
 *   ses animations sont terminées ; seul son bloc collant est capturé. Pour la pleine page,
 *   ses animations sont figées dans leur état final ;
 * - l'en-tête collant est rendu statique pendant les captures de sections, pour ne pas
 *   recouvrir le haut de chaque section.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "@playwright/test";

const MAQUETTE_URL = process.env.MAQUETTE_URL ?? "http://localhost:4000/Main.dc.html";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "docs", "maquette", "captures");

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
] as const;

/** Sections de la maquette, dans l'ordre de la page. Plusieurs sélecteurs = boîte englobante. */
const SECTIONS = [
  {
    slug: "en-tete",
    label: "En-tête (bandeau et barre de navigation)",
    selectors: [".top-note", "header.hdr"],
  },
  { slug: "hero", label: "Hero (carrousel)", selectors: ["#accueil"] },
  { slug: "categories", label: "Catégories", selectors: ["nav.cats"] },
  { slug: "tuiles", label: "Tuiles promotionnelles", selectors: [".tiles"] },
  {
    slug: "pin",
    label: "Section épinglée Smartphones (bloc collant, à 90 % du défilement)",
    selectors: ["section.pin"],
  },
  { slug: "nouveautes", label: "Nouveautés", selectors: ["#nouveautes"] },
  { slug: "marques", label: "Marques", selectors: ["#marques"] },
  { slug: "comparateur", label: "Comparateur", selectors: ["#comparer"] },
  { slug: "quiz", label: "Quiz (aide au choix)", selectors: ["#aide"] },
  { slug: "reassurance", label: "Réassurance", selectors: ["#aide ~ section.sec:not([id])"] },
  { slug: "pied-de-page", label: "Pied de page", selectors: ["footer.foot"] },
] as const;

const CAPTURE_CSS = `
  .reveal, .zoom, .rise { animation: none !important; }
`;
const PIN_FINAL_CSS = `
  .pin-head, .pin-cta, .pin-bg, .ph-a, .ph-b, .ph-c { animation: none !important; }
`;
const STATIC_HEADER_CSS = `
  .hdr { position: relative !important; }
`;

type Box = { x: number; y: number; width: number; height: number };

/** Boîte englobante des sélecteurs, en coordonnées de la page (et non de la fenêtre). */
async function boxOf(page: Page, selectors: readonly string[]): Promise<Box | null> {
  return page.evaluate(
    (sels) => {
      const rects = sels
        .map((s) => document.querySelector(s))
        .filter((e): e is Element => e !== null)
        .map((e) => e.getBoundingClientRect());
      if (rects.length === 0) return null;
      const top = Math.min(...rects.map((r) => r.top)) + window.scrollY;
      const bottom = Math.max(...rects.map((r) => r.bottom)) + window.scrollY;
      const left = Math.min(...rects.map((r) => r.left)) + window.scrollX;
      const right = Math.max(...rects.map((r) => r.right)) + window.scrollX;
      return {
        x: Math.max(0, Math.floor(left)),
        y: Math.max(0, Math.floor(top)),
        width: Math.ceil(right - Math.max(0, left)),
        height: Math.ceil(bottom - top),
      };
    },
    [...selectors],
  );
}

async function preparePage(page: Page) {
  const response = await page.goto(MAQUETTE_URL, { waitUntil: "networkidle" }).catch((error) => {
    throw new Error(
      `Maquette injoignable à ${MAQUETTE_URL}. Servez-la en HTTP (voir l'en-tête du script).\n${error}`,
    );
  });
  if (!response?.ok()) {
    throw new Error(`Maquette : réponse ${response?.status()} pour ${MAQUETTE_URL}`);
  }
  await page.waitForSelector("header.hdr", { state: "visible" });
  await page.evaluate(() => document.fonts.ready);
  // Animations d'entrée du hero : 1,3 s au plus ; on laisse une marge.
  await page.waitForTimeout(2500);
  const pause = page.getByRole("button", { name: "Mettre en pause le défilement" });
  if (await pause.count()) await pause.first().click();
  await page.addStyleTag({ content: CAPTURE_CSS });
  // Charge toutes les images paresseuses en parcourant la page.
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
}

async function main() {
  const browser = await chromium.launch();
  const measures: Record<string, unknown> = {
    url: MAQUETTE_URL,
    date: new Date().toISOString(),
    viewports: {},
  };

  try {
    for (const viewport of VIEWPORTS) {
      const dir = join(OUT_DIR, viewport.name);
      await mkdir(dir, { recursive: true });
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        locale: "fr-FR",
      });
      const page = await context.newPage();
      await preparePage(page);

      const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      const pinFinal = await page.addStyleTag({ content: PIN_FINAL_CSS });
      await page.screenshot({ path: join(dir, "pleine-page.png"), fullPage: true });
      await pinFinal.evaluate((node) => node.parentNode?.removeChild(node));

      await page.addStyleTag({ content: STATIC_HEADER_CSS });
      const sections: Array<{ slug: string; label: string; file: string | null; box: Box | null }> =
        [];
      for (const [index, section] of SECTIONS.entries()) {
        const box = await boxOf(page, section.selectors);
        const file = `${String(index + 1).padStart(2, "0")}-${section.slug}.png`;
        if (!box || box.width === 0 || box.height === 0) {
          console.warn(`  ${viewport.name} px : section « ${section.label} » introuvable.`);
          sections.push({ slug: section.slug, label: section.label, file: null, box });
          continue;
        }
        if (section.slug === "pin") {
          // Défilement réel : 90 % de la course « contain » de la section épinglée.
          const course = Math.max(0, box.height - viewport.height);
          await page.evaluate((y) => window.scrollTo(0, y), box.y + Math.round(course * 0.9));
          await page.waitForTimeout(600);
          await page.locator(".pin-sticky").screenshot({ path: join(dir, file) });
        } else {
          await page.evaluate((y) => window.scrollTo(0, Math.max(0, y - 100)), box.y);
          await page.waitForTimeout(250);
          await page.screenshot({ path: join(dir, file), fullPage: true, clip: box });
        }
        sections.push({
          slug: section.slug,
          label: section.label,
          file: `${viewport.name}/${file}`,
          box,
        });
      }

      (measures.viewports as Record<string, unknown>)[viewport.name] = {
        width: viewport.width,
        pageHeight,
        sections,
      };
      console.log(
        `${viewport.name} px : hauteur totale ${pageHeight} px, ${sections.length} sections.`,
      );
      await context.close();
    }
  } finally {
    await browser.close();
  }

  await writeFile(join(OUT_DIR, "mesures.json"), `${JSON.stringify(measures, null, 2)}\n`, "utf8");
  console.log(`Captures écrites dans ${OUT_DIR}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
