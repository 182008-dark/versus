import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { plannedPathFor, routeFor, routeKeys } from "../src/config/site";
import { products } from "../src/data/catalog";
import { isNew } from "../src/lib/catalog/is-new";

/** Pages publiques livrées (étapes 1 à 3). */
const PAGES = [
  "/",
  "/boutique",
  "/produit/iphone-18-pro",
  "/marques/apple",
  "/marques/samsung",
  "/marques/xiaomi",
  "/mentions-legales",
  "/credits",
  "/confidentialite",
  "/cgv",
  "/livraison",
  "/garantie",
];

/** Pages d'information de l'étape 2 et leur titre de niveau 1. */
const INFO_PAGES = [
  { path: "/confidentialite", title: "Confidentialité", link: "Confidentialité" },
  { path: "/cgv", title: "Conditions générales de vente", link: "CGV" },
  { path: "/livraison", title: "Livraison et retours", link: "Livraison et retours" },
  { path: "/garantie", title: "Garantie", link: "Garantie" },
];

/** Principe 7 du plan : le bandeau « fictif » est visible partout. */
async function expectFictiveNotice(page: Page) {
  const lead = page.getByText("Projet pédagogique", { exact: true });
  await expect(lead).toBeVisible();
  // Le pied de page répète « Prix indicatifs en FCFA » : on vérifie la phrase du bandeau.
  const notice = page.locator("p").filter({ has: lead });
  await expect(notice).toContainText("Site fictif, aucune vente réelle");
  await expect(notice).toContainText("Prix indicatifs en FCFA");
}

/**
 * Compte, par produit, les visuels VISIBLES : chaque `[data-product]` et chaque `img[alt]` non
 * vide hors d'un `[data-product]` (rattachée au produit par son alternative). Diapositives
 * cachées et onglets inactifs (visibility, display, hidden) sont exclus.
 */
async function countVisuals(page: Page) {
  const alts = Object.fromEntries(products.map((product) => [product.image_alt, product.code]));
  return page.evaluate((altToCode) => {
    const counts: Record<string, number> = {};
    const visible = (element: Element) =>
      element.checkVisibility({ visibilityProperty: true }) && element.getClientRects().length > 0;
    for (const element of document.querySelectorAll("[data-product]")) {
      const code = element.getAttribute("data-product");
      if (code && visible(element)) counts[code] = (counts[code] ?? 0) + 1;
    }
    for (const image of document.querySelectorAll<HTMLImageElement>("img[alt]:not([alt=''])")) {
      if (image.closest("[data-product]") || !visible(image)) continue;
      const code = altToCode[image.alt] ?? image.alt;
      counts[code] = (counts[code] ?? 0) + 1;
    }
    return counts;
  }, alts);
}

test.describe("accueil de l'étape 3", () => {
  test("affiche un seul titre de niveau 1", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: "VERSUS, Apple, Samsung et Xiaomi au Togo" }),
    ).toBeAttached();
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("n'affiche le badge Nouveau que pour les produits dont la date est valide", async ({
    page,
  }) => {
    await page.goto("/");
    const today = process.env.VS_TODAY ?? "2026-11-12";
    let shown = 0;
    for (const product of products) {
      const card = page.locator(
        `[data-product-card="${product.code}"], [data-product-slide="${product.code}"]`,
      );
      // L'accueil ne montre que les produits de home_slots, pas tout le catalogue.
      if ((await card.count()) === 0) continue;
      shown += 1;
      const badge = card.getByText("Nouveau", { exact: true });
      if (isNew(product, today)) await expect(badge.first()).toBeAttached();
      else await expect(badge).toHaveCount(0);
    }
    expect(shown, "produits de l'accueil vérifiés").toBeGreaterThan(5);
  });

  test("ne montre aucun produit plus de trois fois, à l'état initial et après défilement", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const initial = await countVisuals(page);
    expect(Object.keys(initial).length, "visuels comptés à l'état initial").toBeGreaterThan(5);
    expect(Math.max(...Object.values(initial)), JSON.stringify(initial)).toBeLessThanOrEqual(3);

    const height = await page.locator("body").evaluate((body) => body.scrollHeight);
    for (let y = 0; y < height; y += 700) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(20);
    }
    const scrolled = await countVisuals(page);
    expect(Math.max(...Object.values(scrolled)), JSON.stringify(scrolled)).toBeLessThanOrEqual(3);
  });

  test("reste sous 6 000 px de haut sur grand écran", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const height = await page.locator("body").evaluate((body) => body.scrollHeight);
    expect(height).toBeLessThanOrEqual(6000);
  });

  test("les catégories, fiches et boutique sont accessibles depuis l'accueil", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Catégories" })
      .getByRole("link", { name: "Smartphones" })
      .click();
    await expect(page).toHaveURL(/\/boutique#smartphones$/);
    await expect(page.getByRole("heading", { level: 2, name: "Smartphones" })).toBeVisible();
    await page.goto("/");
    await page.locator(".hero-slide-active").getByRole("link", { name: "Acheter" }).click();
    await expect(page).toHaveURL(/\/produit\/iphone-18-pro$/);
    await expect(page.getByRole("heading", { level: 1, name: "iPhone 18 Pro" })).toBeVisible();
  });

  test("robots.txt interdit tout", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    expect(await response.text()).toMatch(/Disallow: \/\s*$/m);
  });

  test("structure : lang fr, un seul <main id=contenu>, lien d'évitement", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("main#contenu")).toHaveCount(1);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Aller au contenu" })).toBeFocused();
  });

  test("mène aux mentions légales et aux crédits", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Mentions légales" }).click();
    await expect(page).toHaveURL(/\/mentions-legales$/);
    await expect(page.getByRole("heading", { level: 1, name: "Mentions légales" })).toBeVisible();
    await page.goto("/");
    await page.getByRole("link", { name: "Crédits" }).click();
    await expect(page).toHaveURL(/\/credits$/);
    await expect(page.getByRole("heading", { level: 1, name: "Crédits" })).toBeVisible();
  });
});

test.describe("pages d'information de l'étape 2", () => {
  for (const { path, title, link } of INFO_PAGES) {
    test(`le pied de page mène à ${path}`, async ({ page }) => {
      await page.goto("/");
      await page.getByRole("contentinfo").getByRole("link", { name: link, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
      await expect(page.getByText(/aucune vente/i).first()).toBeVisible();
    });
  }

  test("les montants sont formatés en FCFA (espaces insécables)", async ({ page }) => {
    await page.goto("/livraison");
    const fee = await page
      .getByRole("row", { name: /Lomé/ })
      .getByRole("cell")
      .first()
      .textContent();
    // formatFCFA : espace fine insécable (U+202F) entre les milliers, insécable (U+00A0) avant FCFA.
    expect(fee).toBe("1\u202F500\u00A0FCFA");
  });
});

test("rail : flèches inactives aux extrémités et utilisables au clavier", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const previous = page.getByRole("button", { name: "Produits précédents" });
  const next = page.getByRole("button", { name: "Produits suivants" });
  await expect(previous).toHaveAttribute("aria-disabled", "true");
  await expect(next).not.toHaveAttribute("aria-disabled", "true");

  // Tabulation jusqu'à « Produits suivants », puis Entrée jusqu'au bout du rail.
  await previous.focus();
  await page.keyboard.press("Tab");
  await expect(next).toBeFocused();
  for (let index = 0; index < 12; index += 1) {
    if ((await next.getAttribute("aria-disabled")) === "true") break;
    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);
  }
  await expect(next).toHaveAttribute("aria-disabled", "true");
  await expect(previous).not.toHaveAttribute("aria-disabled", "true");
  // Le focus reste sur la flèche (aria-disabled, jamais disabled) : la position est conservée.
  await expect(next).toBeFocused();
  const list = page.getByRole("list", { name: "Nouveautés et produits du catalogue" });
  const end = await list.evaluate((element) => element.scrollLeft);
  await page.keyboard.press("Enter");
  expect(await list.evaluate((element) => element.scrollLeft)).toBe(end);

  // Retour au début avec « Produits précédents » au clavier.
  await page.keyboard.press("Shift+Tab");
  await expect(previous).toBeFocused();
  for (let index = 0; index < 12; index += 1) {
    if ((await previous.getAttribute("aria-disabled")) === "true") break;
    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);
  }
  await expect(previous).toHaveAttribute("aria-disabled", "true");
  await expect(previous).toBeFocused();

  // La liste elle-même défile aussi aux flèches du clavier.
  await list.focus();
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => list.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
});

test("chaque élément « masqué » de la table de l'étape 3 est absent du DOM", async ({ page }) => {
  await page.goto("/");
  // Aucune route non livrée n'est visée par un lien ou un formulaire (liste issue de routeFor).
  for (const key of routeKeys.filter((routeKey) => routeFor(routeKey) === null)) {
    const path = plannedPathFor(key);
    const hash = path.includes("#") ? `#${path.split("#")[1]}` : null;
    const selectors = [
      `a[href="${path}"]`,
      `a[href^="${path}?"]`,
      `a[href^="${path}/"]`,
      `form[action="${path}"]`,
      ...(hash ? [`a[href="${hash}"]`, `[id="${hash.slice(1)}"]`] : []),
    ];
    await expect(page.locator(selectors.join(", ")), `route ${key} (${path})`).toHaveCount(0);
  }
  // QuizTeaser (#aide) et son formulaire GET.
  await expect(page.locator("#aide, form[action='/aide-au-choix']")).toHaveCount(0);
  // Hero et tuiles : « Comparer » masqué.
  for (const zone of [page.locator(".hero-carousel"), page.locator(".promo-grid")]) {
    await expect(zone.getByRole("link", { name: /comparer/i })).toHaveCount(0);
    await expect(zone.getByRole("button", { name: /comparer/i })).toHaveCount(0);
  }
  // Cartes : « + Comparer » ; comparateur : panier et lien complet ; CategoryNav : aide au choix.
  for (const name of [
    /\+ ?Comparer/,
    /Comparateur complet/,
    /Ajouter au panier/,
    /Aide au choix/,
  ]) {
    await expect(page.getByRole("link", { name })).toHaveCount(0);
    await expect(page.getByRole("button", { name })).toHaveCount(0);
  }
  // En-tête : Rechercher, Comparateur, Mon compte, Panier.
  const header = page.getByRole("banner");
  for (const name of ["Rechercher", "Comparateur", "Mon compte", "Panier"]) {
    await expect(header.getByRole("link", { name })).toHaveCount(0);
  }
  // Pied de page : FAQ, Contact, À propos.
  const footer = page.getByRole("contentinfo");
  for (const name of ["FAQ", "Contact", "À propos"]) {
    await expect(footer.getByRole("link", { name, exact: true })).toHaveCount(0);
  }
  // Ce qui est livré reste là : « Comparer » de la navigation par catégories mène à #comparer.
  await expect(
    page.getByRole("navigation", { name: "Catégories" }).getByRole("link", { name: "Comparer" }),
  ).toHaveAttribute("href", "/#comparer");
  await expect(page.locator("#comparer")).toHaveCount(1);
});

test("une fiche produit inconnue répond 404 dès la première visite", async ({ request }) => {
  // Slug jamais demandé : aucune version en cache ne peut masquer un premier 200.
  const slug = `produit-inconnu-${Date.now().toString(36)}`;
  const response = await request.get(`/produit/${slug}`);
  expect(response.status()).toBe(404);
  expect(await response.text()).toContain("Page introuvable");
});

test.describe("pages publiques", () => {
  for (const path of PAGES) {
    test(`bandeau « Projet pédagogique » sur ${path}`, async ({ page }) => {
      await page.goto(path);
      await expectFictiveNotice(page);
    });

    test(`non indexable (meta robots noindex) sur ${path}`, async ({ page }) => {
      await page.goto(path);
      const robots = page.locator('meta[name="robots"]');
      await expect(robots).toHaveCount(1);
      await expect(robots).toHaveAttribute("content", /noindex/);
    });

    test(`axe : aucune violation sérieuse ou critique sur ${path}`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      const blocking = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
      expect(blocking.map((v) => `${v.id} : ${v.help}`)).toEqual([]);
    });
  }
});

test.describe("page 404", () => {
  const MISSING = "/page-inexistante-versus";

  test("répond 404 et affiche le bandeau « Projet pédagogique »", async ({ page }) => {
    const response = await page.goto(MISSING);
    expect(response?.status()).toBe(404);
    await expectFictiveNotice(page);
    await expect(page.getByRole("heading", { level: 1, name: "Page introuvable" })).toBeVisible();
    await expect(page.locator("main#contenu")).toHaveCount(1);
  });

  test("n'est pas indexable", async ({ page }) => {
    await page.goto(MISSING);
    const robots = page.locator('meta[name="robots"]');
    expect(await robots.count()).toBeGreaterThanOrEqual(1);
    for (const content of await robots.evaluateAll((els) =>
      els.map((el) => el.getAttribute("content") ?? ""),
    )) {
      expect(content).toMatch(/noindex/);
    }
  });

  test("axe : aucune violation sérieuse ou critique", async ({ page }) => {
    await page.goto(MISSING);
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(blocking.map((v) => `${v.id} : ${v.help}`)).toEqual([]);
  });
});
