import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/** Pages publiques livrées à l'étape 1. */
const PAGES = ["/", "/mentions-legales", "/credits"];

/** Principe 7 du plan : le bandeau « fictif » est visible partout. */
async function expectFictiveNotice(page: Page) {
  await expect(page.getByText("Projet pédagogique", { exact: true })).toBeVisible();
  await expect(page.getByText(/Site fictif, aucune vente réelle/)).toBeVisible();
  await expect(page.getByText(/Prix indicatifs en FCFA/)).toBeVisible();
}

test.describe("accueil provisoire", () => {
  test("affiche le titre « Bientôt en ligne »", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Bientôt en ligne" })).toBeVisible();
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
