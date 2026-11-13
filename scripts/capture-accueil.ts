import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "docs", "maquette", "implementation");

async function main() {
  const browser = await chromium.launch();
  try {
    for (const viewport of [
      { name: "1440", width: 1440, height: 1000 },
      { name: "390", width: 390, height: 844 },
    ]) {
      const directory = join(OUT_DIR, viewport.name);
      await mkdir(directory, { recursive: true });
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        reducedMotion: "reduce",
      });
      await page.goto(new URL("/", SITE_URL).href, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: join(directory, "accueil.png"),
        fullPage: true,
        animations: "disabled",
      });
      await page.close();
      console.log(`Capture de l'accueil ${viewport.name} px : ${directory}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
