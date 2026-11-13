import { expect, test, type Page } from "@playwright/test";

/**
 * Principe 3 du plan : un lien n'apparaît que si sa page existe.
 * Depuis `/` et `/styleguide` (non lié depuis le site, visible sous next start), on parcourt
 * les pages internes et on vérifie :
 * - chaque <a href> et chaque <form action> interne répond 200 (GET) ;
 * - chaque ancre `#id` (seule ou `chemin#id`) existe sur la page cible ;
 * - aucun lien ne mène « nulle part » : href="" (ou action=""), href="#", "/#", "/credits#"…
 */

const MAX_PAGES = 200;

type Anchor = { from: string; target: string; id: string };

async function collectTargets(page: Page) {
  return page.evaluate(() => ({
    hrefs: Array.from(document.querySelectorAll("a[href]"), (a) => a.getAttribute("href") ?? ""),
    actions: Array.from(
      document.querySelectorAll("form[action]"),
      (f) => f.getAttribute("action") ?? "",
    ),
  }));
}

/** Une ressource dont le dernier segment a une extension (image, PDF…) n'est pas explorée. */
function isPage(pathname: string) {
  return !/\.[a-z0-9]+$/i.test(pathname.split("/").at(-1) ?? "");
}

test("liens internes, actions de formulaires et ancres", async ({ page, request, baseURL }) => {
  test.setTimeout(120_000);
  const origin = new URL(baseURL ?? "http://localhost:3000").origin;
  const queue = ["/", "/styleguide"];
  const visited = new Set<string>();
  const statusCache = new Map<string, number>();
  const anchors: Anchor[] = [];
  const errors: string[] = [];

  while (queue.length > 0 && visited.size < MAX_PAGES) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const response = await page.goto(current);
    if (response?.status() !== 200) {
      errors.push(`${current} répond ${response?.status() ?? "sans réponse"}`);
      continue;
    }

    const { hrefs, actions } = await collectTargets(page);
    for (const raw of [...hrefs, ...actions]) {
      // Tests sur la chaîne brute : new URL("/#") donne hash === "", un fragment vide
      // passerait donc pour un lien valide vers la page.
      const trimmed = raw.trim();
      if (trimmed === "") {
        errors.push(`lien ou action vide sur ${current}`);
        continue;
      }
      if (trimmed.endsWith("#")) {
        errors.push(`ancre vide (href="${raw}") sur ${current}`);
        continue;
      }
      const url = new URL(raw, origin + current);
      if (url.origin !== origin) continue; // lien externe, mailto:, tel:

      const target = url.pathname + url.search;
      if (url.hash) {
        anchors.push({ from: current, target, id: decodeURIComponent(url.hash.slice(1)) });
      }
      if (!statusCache.has(target)) {
        const res = await request.get(target);
        statusCache.set(target, res.status());
      }
      const status = statusCache.get(target);
      if (status !== 200) {
        errors.push(`${current} → ${raw} répond ${status}`);
      } else if (isPage(url.pathname) && !visited.has(target)) {
        queue.push(target);
      }
    }
  }

  for (const anchor of anchors) {
    await page.goto(anchor.target);
    const count = await page.locator(`[id="${anchor.id.replace(/"/g, '\\"')}"]`).count();
    if (count === 0) errors.push(`${anchor.from} → ${anchor.target}#${anchor.id} : id introuvable`);
  }

  // Accueil, styleguide et les 6 pages d'information (mentions, crédits, confidentialité, CGV,
  // livraison, garantie).
  expect(visited.size, "accueil, styleguide et pages d'information").toBeGreaterThanOrEqual(8);
  for (const path of ["/confidentialite", "/cgv", "/livraison", "/garantie"]) {
    expect(visited.has(path), `${path} est atteinte par un lien`).toBe(true);
  }
  expect(errors).toEqual([]);
});
