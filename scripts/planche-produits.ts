/**
 * Planche contact des visuels produits (refonte, lot 1) : les 30 visuels de public/products sur
 * un fond uniforme, groupés par marque, avec le nom, le prix « Dès … FCFA », le code et le poids
 * du fichier. Sert à valider l'homogénéité du recadrage avant d'écrire les pages.
 *
 * Usage : npm run capture:planche (aucun serveur requis : la page lit les PNG en file://).
 * Produit docs/refonte/planche-produits.html (source) et docs/refonte/planche-produits.png.
 */
import { statSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { brands, products } from "../src/data/catalog";
import { formatFCFA } from "../src/lib/format/fcfa";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "docs", "refonte");
const HTML = join(OUT_DIR, "planche-produits.html");
const PNG = join(OUT_DIR, "planche-produits.png");

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const kilobytes = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

function tile(product: (typeof products)[number]) {
  const file = join(ROOT, "public", product.image_src ?? "");
  const weight = `${kilobytes.format(statSync(file).size / 1000)} Ko`;
  const price =
    product.min_price_fcfa === null
      ? "Prix indisponible"
      : `Dès ${formatFCFA(product.min_price_fcfa)}`;
  return `      <figure class="tile">
        <div class="art"><img src="../../public${product.image_src}" alt="" width="${product.image_width}" height="${product.image_height}"></div>
        <figcaption>
          <strong>${escape(product.name)}</strong>
          <span class="price">${escape(price)}</span>
          <span class="meta">${product.code}.png · ${product.image_width} × ${product.image_height} · ${weight}</span>
        </figcaption>
      </figure>`;
}

function page() {
  const sections = brands
    .map((brand) => {
      const items = products.filter((product) => product.brand_slug === brand.slug);
      return `    <section>
      <h2>${escape(brand.name)} <small>${items.length} produits</small></h2>
      <div class="grid">
${items.map(tile).join("\n")}
      </div>
    </section>`;
    })
    .join("\n");
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <title>VERSUS · planche des visuels produits</title>
    <style>
      body { margin: 0; padding: 32px; background: #ffffff; color: #1d1d1f; font: 14px/1.4 system-ui, "Segoe UI", sans-serif; width: 1176px; }
      h1 { margin: 0 0 4px; font-size: 26px; }
      p.intro { margin: 0 0 24px; color: #5f6368; }
      h2 { margin: 28px 0 12px; font-size: 20px; }
      h2 small { font-weight: 400; color: #5f6368; font-size: 14px; }
      .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
      .tile { margin: 0; background: #f2f3f1; border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
      .art { height: 180px; display: flex; align-items: center; justify-content: center; }
      .art img { max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; }
      figcaption { display: flex; flex-direction: column; gap: 2px; }
      .price { font-weight: 700; }
      .meta { color: #5f6368; font-size: 12px; }
    </style>
  </head>
  <body>
    <h1>Planche des ${products.length} visuels produits</h1>
    <p class="intro">Refonte VERSUS, lot 1. Fond uniforme, cadre de 180 px de haut, object-fit: contain : même rendu que les cartes de la boutique. Prix indicatifs (prix officiel en France × 655,957, arrondi au millier).</p>
${sections}
  </body>
</html>
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(HTML, page(), "utf8");
  const browser = await chromium.launch();
  try {
    const tab = await browser.newPage({ viewport: { width: 1240, height: 900 } });
    await tab.goto(pathToFileURL(HTML).href, { waitUntil: "load" });
    await tab.evaluate(() =>
      Promise.all(Array.from(document.images).map((image) => image.decode())),
    );
    await tab.screenshot({ path: PNG, fullPage: true });
  } finally {
    await browser.close();
  }
  console.log(`Planche écrite : ${HTML} et ${PNG}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
