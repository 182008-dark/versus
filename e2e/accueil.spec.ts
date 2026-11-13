import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { products } from "../src/data/catalog";
import { isNew } from "../src/lib/catalog/is-new";

/** Pages publiques livrées (étapes 1 à 3). */
const PAGES = [
  "/",
  "/boutique",
  "/produit/iphone-18-pro",
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
    for (const product of products) {
      const card = page.locator(
        `[data-product-card="${product.code}"], [data-product-slide="${product.code}"]`,
      );
      const badge = card.getByText("Nouveau", { exact: true });
      if (isNew(product, today)) await expect(badge.first()).toBeAttached();
      else await expect(badge).toHaveCount(0);
    }
  });

  test("ne montre aucun produit plus de trois fois après défilement complet", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const height = await page.locator("body").evaluate((body) => body.scrollHeight);
    for (let y = 0; y < height; y += 700) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(20);
    }
    const counts = await page.locator("[data-product]").evaluateAll((elements) =>
      elements.reduce<Record<string, number>>((result, element) => {
        const code = element.getAttribute("data-product");
        const visible =
          element.getClientRects().length > 0 &&
          getComputedStyle(element).visibility !== "hidden" &&
          getComputedStyle(element).display !== "none";
        if (code && visible) result[code] = (result[code] ?? 0) + 1;
        return result;
      }, {}),
    );
    expect(counts).not.toEqual({});
    expect(Math.max(...Object.values(counts))).toBeLessThanOrEqual(3);
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

  test("le texte actif du carrousel reste visible avec mouvement réduit", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".hero-slide-active h2")).toBeVisible();
    await expect(page.locator(".hero-slide-active h2")).toHaveText("iPhone 18 Pro");
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

test("le rail de produits reste utilisable au clavier et ses flèches respectent les extrémités", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const previous = page.getByRole("button", { name: "Produits précédents" });
  const next = page.getByRole("button", { name: "Produits suivants" });
  await expect(previous).toBeDisabled();
  await expect(next).toBeEnabled();
  await next.click();
  await expect(previous).toBeEnabled();

  const rail = page.getByRole("list", { name: "Nouveautés et produits du catalogue" });
  const before = await rail.evaluate((element) => element.scrollLeft);
  await rail.focus();
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => rail.evaluate((element) => element.scrollLeft)).toBeGreaterThan(before);
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
