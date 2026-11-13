import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Gabarit global de l'étape 2 : landmarks, menu mobile au clavier, absence de défilement
 * horizontal à 375 px, accessibilité de /mentions-legales et /styleguide.
 */

/** Pages livrées à l'étape 2 (le styleguide est visible sous next start, sans VERCEL_ENV). */
const PAGES = [
  "/",
  "/mentions-legales",
  "/credits",
  "/confidentialite",
  "/cgv",
  "/livraison",
  "/garantie",
  "/styleguide",
];

async function blockingViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id} : ${v.help} (${v.nodes.length})`);
}

/** Règle axe `region` (impact modéré) : tout le contenu visible est dans un landmark. */
async function regionViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withRules(["region"]).analyze();
  return results.violations.flatMap((v) => v.nodes.map((n) => n.target.join(" ")));
}

/** Pages hors gabarit de groupe ou dans un autre gabarit, d'où l'on suit le logo du menu. */
const LOGO_ORIGINS = ["/styleguide", "/cgv", "/page-inexistante-versus"];

test.describe("landmarks", () => {
  for (const path of PAGES) {
    test(`un seul main, banner et contentinfo au premier niveau sur ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("main#contenu")).toHaveCount(1);
      // banner et contentinfo : un seul de chaque, enfants directs de <body>, hors du <main>.
      await expect(page.getByRole("banner")).toHaveCount(1);
      await expect(page.getByRole("contentinfo")).toHaveCount(1);
      await expect(page.locator("body > header")).toHaveCount(1);
      await expect(page.locator("body > footer")).toHaveCount(1);
      // Ordre du gabarit : bandeau fictif, en-tête, contenu, pied de page.
      const order = await page.evaluate(() =>
        Array.from(document.body.children)
          .map((el) => el.tagName.toLowerCase())
          .filter((tag) => ["header", "main", "footer"].includes(tag)),
      );
      expect(order).toEqual(["header", "main", "footer"]);
    });
  }

  test("la page 404 recompose le gabarit avec son propre main", async ({ page }) => {
    const response = await page.goto("/page-inexistante-versus");
    expect(response?.status()).toBe(404);
    await expect(page.locator("main#contenu")).toHaveCount(1);
    await expect(page.locator("body > header")).toHaveCount(1);
    await expect(page.locator("body > footer")).toHaveCount(1);
  });
});

test.describe("en-tête de l'étape 2", () => {
  test("les icônes et la navigation dont la route n'est pas livrée sont absentes du DOM", async ({
    page,
  }) => {
    await page.goto("/");
    const header = page.getByRole("banner");
    for (const name of ["Rechercher", "Comparateur", "Mon compte", "Panier"]) {
      await expect(header.getByRole("link", { name })).toHaveCount(0);
      await expect(header.getByRole("button", { name })).toHaveCount(0);
    }
    for (const name of ["Apple", "Samsung", "Xiaomi", "Smartphones", "Comparer"]) {
      await expect(page.getByRole("link", { name, exact: true })).toHaveCount(0);
    }
    await expect(page.locator('a[href="#"]')).toHaveCount(0);
  });

  test("le bouton du menu mobile n'existe pas en mode bureau", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Menu", exact: true })).toBeHidden();
  });
});

test.describe("menu mobile à 375 px", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("au clavier : ouverture, focus piégé, Échap, focus restitué", async ({ page }) => {
    await page.goto("/mentions-legales");
    const button = page.getByRole("button", { name: "Menu", exact: true });
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("aria-expanded", "false");

    // Atteindre le bouton au clavier : lien d'évitement, logo, puis menu.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(button).toBeFocused();
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("button", { name: "Fermer le menu" })).toBeFocused();

    // Le focus reste dans la boîte, dans les deux sens.
    for (const key of ["Tab", "Tab", "Tab", "Tab", "Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab"]) {
      await page.keyboard.press(key);
      expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toBeFocused();
  });

  test("un lien du menu mène à sa page et ferme le menu", async ({ page }) => {
    await page.goto("/mentions-legales");
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await dialog.getByRole("link", { name: "Garantie" }).click();
    await expect(page).toHaveURL(/\/garantie$/);
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("heading", { level: 1, name: "Garantie" })).toBeVisible();
  });

  test("axe : aucune violation sérieuse menu ouvert", async ({ page }) => {
    await page.goto("/mentions-legales");
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
    expect(await blockingViolations(page)).toEqual([]);
  });

  for (const from of LOGO_ORIGINS) {
    test(`le logo du menu ferme le menu et laisse l'accueil utilisable, depuis ${from}`, async ({
      page,
    }) => {
      await page.goto(from);
      const menuButton = page.getByRole("button", { name: "Menu", exact: true });
      await menuButton.click();
      const dialog = page.getByRole("dialog", { name: "Menu" });
      await expect(dialog).toBeVisible();
      // Nom calculé par Chromium : « VERSUS , accueil » (suffixe sr-only en position absolue).
      await dialog.getByRole("link", { name: /^VERSUS\s*, accueil$/ }).click();
      await expect(page).toHaveURL(/\/$/);

      // Aucun <dialog> ouvert, même dans une page gardée masquée par <Activity>.
      await expect(page.locator("dialog[open]")).toHaveCount(0);
      await expect(menuButton).toHaveAttribute("aria-expanded", "false");
      // La page n'est pas inerte : le bouton reçoit le clic et le menu se rouvre.
      await menuButton.click();
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(menuButton).toBeFocused();
    });
  }

  for (const path of ["/mentions-legales", "/styleguide"]) {
    test(`axe à 375 px : aucune violation sérieuse sur ${path}`, async ({ page }) => {
      await page.goto(path);
      expect(await blockingViolations(page)).toEqual([]);
      expect(await regionViolations(page)).toEqual([]);
    });
  }

  test("lien d'évitement : capsule de 44 px une fois focalisé", async ({ page }) => {
    await page.goto("/garantie");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Aller au contenu" });
    await expect(skip).toBeFocused();
    const box = await skip.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.y).toBeGreaterThanOrEqual(0);
    await page.keyboard.press("Enter");
    await expect(page.locator("main#contenu")).toBeFocused();
  });

  for (const path of PAGES) {
    test(`pas de défilement horizontal sur ${path}`, async ({ page }) => {
      await page.goto(path);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  }
});

test.describe("redistribution à 320 px (1280 px zoomés à 400 %, WCAG 1.4.10)", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  for (const path of PAGES) {
    test(`pas de défilement horizontal sur ${path}`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test.describe("accessibilité (axe)", () => {
  for (const path of ["/mentions-legales", "/styleguide"]) {
    test(`aucune violation sérieuse ou critique sur ${path}`, async ({ page }) => {
      await page.goto(path);
      const violations = await blockingViolations(page);
      expect(violations).toEqual([]);
      // Critère explicite de l'étape 2.
      expect(violations.join()).not.toMatch(/landmark-(banner|contentinfo)-is-top-level/);
      // Le bandeau « Projet pédagogique » est dans une région nommée.
      expect(await regionViolations(page)).toEqual([]);
    });
  }

  test("lien d'évitement : capsule de 44 px une fois focalisé (1440 px)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/garantie");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Aller au contenu" });
    await expect(skip).toBeFocused();
    expect((await skip.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe("pied de page", () => {
  test("la page courante porte aria-current et reste soulignée (1440 px)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/livraison");
    const footer = page.getByRole("contentinfo");
    const current = footer.getByRole("link", { name: "Livraison et retours" });
    await expect(current).toHaveAttribute("aria-current", "page");
    await expect(current).toHaveCSS("text-decoration-line", "underline");
    await expect(footer.getByRole("link", { name: "Garantie" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});

test.describe("styleguide", () => {
  test("visible sous next start (VERCEL_ENV absent) avec les contrastes mesurés", async ({
    page,
  }) => {
    const response = await page.goto("/styleguide");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "Styleguide VERSUS" })).toBeVisible();
    const accentRow = page.getByRole("row", { name: /Lien et texte accent sur fond blanc/ });
    await expect(accentRow).toContainText("4,95:1");
    await expect(accentRow).toContainText("AA");
  });

  test("la boîte de dialogue se ferme avec Échap et rend le focus", async ({ page }) => {
    await page.goto("/styleguide");
    const trigger = page.getByRole("button", { name: "Ouvrir la boîte de dialogue" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Remplacer la sélection ?" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Annuler" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
