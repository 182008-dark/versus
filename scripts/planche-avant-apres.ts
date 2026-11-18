/**
 * Planche avant / après d'un lot de la refonte : deux captures pleine page côte à côte, réduites
 * à la même largeur, avec un titre et une légende. Aucun serveur requis (images lues en file://).
 *
 * Usage : npm run capture:comparaison -- <avant.png> <après.png> <sortie.png> [titre]
 *   ex. npm run capture:comparaison -- docs/refonte/lot-2/avant/styleguide-1440.png \
 *         docs/refonte/lot-2/apres/styleguide-1440.png docs/refonte/lot-2/comparaison.png \
 *         "Lot 2 : /styleguide à 1440 px"
 *   LARGEUR  largeur de chaque colonne en pixels (défaut : 640)
 */
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const COLUMN = Number(process.env.LARGEUR ?? 640);

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function html(before: string, after: string, title: string) {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <style>
      body { margin: 0; padding: 28px; background: #e9ece9; color: #1a1d1b; font: 15px/1.4 system-ui, "Segoe UI", sans-serif; width: ${COLUMN * 2 + 24}px; }
      h1 { margin: 0 0 4px; font-size: 24px; }
      p { margin: 0 0 20px; color: #5c635f; }
      .grid { display: grid; grid-template-columns: ${COLUMN}px ${COLUMN}px; gap: 24px; align-items: start; }
      figure { margin: 0; }
      figcaption { margin-bottom: 8px; font-weight: 700; font-size: 17px; }
      img { display: block; width: ${COLUMN}px; height: auto; border-radius: 8px; box-shadow: 0 1px 2px rgb(0 0 0 / .08), 0 12px 32px -16px rgb(0 0 0 / .25); }
    </style>
  </head>
  <body>
    <h1>${escape(title)}</h1>
    <p>Captures pleine page, mouvement réduit, réduites à ${COLUMN} px de large.</p>
    <div class="grid">
      <figure><figcaption>Avant</figcaption><img src="${pathToFileURL(before).href}" alt=""></figure>
      <figure><figcaption>Après</figcaption><img src="${pathToFileURL(after).href}" alt=""></figure>
    </div>
  </body>
</html>`;
}

async function main() {
  const [before, after, output, title = "Avant / après"] = process.argv.slice(2);
  if (!before || !after || !output) {
    throw new Error("Usage : planche-avant-apres.ts <avant.png> <après.png> <sortie.png> [titre]");
  }
  // Page écrite dans un dossier temporaire : une page about:blank ne lit pas d'image en file://.
  const dir = await mkdtemp(join(tmpdir(), "versus-planche-"));
  const source = join(dir, "planche.html");
  await writeFile(source, html(resolve(before), resolve(after), title));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: COLUMN * 2 + 80, height: 800 } });
    await page.goto(pathToFileURL(source).href, { waitUntil: "load" });
    await page.evaluate(() => Promise.all([...document.images].map((img) => img.decode())));
    await page.screenshot({ path: resolve(output), fullPage: true });
    console.log(resolve(output));
  } finally {
    await browser.close();
    await rm(dir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
