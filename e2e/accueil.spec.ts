import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("accueil provisoire", () => {
  test("affiche le bandeau « Projet pédagogique »", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Projet pédagogique", { exact: true })).toBeVisible();
    await expect(page.getByText(/Site fictif, aucune vente réelle/)).toBeVisible();
    await expect(page.getByText(/Prix indicatifs en FCFA/)).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Bientôt en ligne" })).toBeVisible();
  });

  test("n'est pas indexable (meta robots noindex)", async ({ page }) => {
    await page.goto("/");
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveCount(1);
    await expect(robots).toHaveAttribute("content", /noindex/);
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

  for (const path of ["/", "/mentions-legales", "/credits"]) {
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
