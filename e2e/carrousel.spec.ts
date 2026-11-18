import { expect, test, type Page } from "@playwright/test";

const HERO = ".hero-carousel";

async function activeSlide(page: Page) {
  return page.locator(".hero-slide-active").getAttribute("data-product-slide");
}

test.describe("carrousel manuel de l'accueil", () => {
  test("ne change pas de diapositive sans action du visiteur", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(HERO)).toHaveAttribute("data-manual", "");
    await expect(page.locator(".hero-slides")).toHaveAttribute("aria-live", "polite");
    expect(await activeSlide(page)).toBe("ip18");
    await page.waitForTimeout(6500);
    expect(await activeSlide(page)).toBe("ip18");
    // Aucun bouton de lecture ou de pause : il n'y a pas de défilement automatique.
    await expect(page.getByRole("button", { name: /défilement|lecture|pause/i })).toHaveCount(0);
  });

  test("change avec les commandes, les points et les flèches du clavier", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Diapositive suivante" }).click();
    expect(await activeSlide(page)).toBe("s26u");
    await page.getByRole("button", { name: "Afficher Xiaomi 17 Ultra" }).click();
    expect(await activeSlide(page)).toBe("x17u");
    await page.getByRole("button", { name: "Afficher Xiaomi 17 Ultra" }).focus();
    await page.keyboard.press("ArrowLeft");
    expect(await activeSlide(page)).toBe("s26u");
    await expect(page.getByRole("button", { name: "Afficher Galaxy S26 Ultra" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(page.getByRole("button", { name: "Afficher iPhone 18 Pro" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  test("le clavier n'atteint jamais le contenu d'une diapositive inactive", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator(".hero-slide-active").getByRole("link").first().focus();
    const visited: { active: boolean; controls: boolean }[] = [];
    for (let index = 0; index < 12; index += 1) {
      const where = await page.evaluate(() => {
        const element = document.activeElement;
        return element?.closest(".hero-carousel")
          ? {
              active: Boolean(element.closest(".hero-slide-active")),
              controls: Boolean(element.closest(".hero-controls")),
            }
          : null;
      });
      if (!where) break;
      visited.push(where);
      await page.keyboard.press("Tab");
    }
    expect(visited.length, "éléments du hero atteints au clavier").toBeGreaterThan(4);
    for (const where of visited) expect(where.active || where.controls).toBe(true);
    // Les diapositives cachées sont inertes : aucun de leurs liens n'est focalisable.
    for (const slide of await page.locator(".hero-slide:not(.hero-slide-active)").all()) {
      await expect(slide).toHaveAttribute("inert", "");
      await expect(slide).toHaveAttribute("aria-hidden", "true");
    }
  });

  test("garde les changements lisibles sous mouvement réduit, point actif compris", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".hero-slide-active h2")).toHaveText("iPhone 18 Pro");
    for (const element of await page.locator(".hero-slide-active .hero-text > *").all()) {
      await expect(element).toBeVisible();
      await expect(element).toHaveCSS("opacity", "1");
    }
    await page.getByRole("button", { name: "Diapositive suivante" }).click();
    await expect(page.locator(".hero-slide-active h2")).toHaveText("Galaxy S26 Ultra");
    await expect(page.locator(".hero-dot-active .hero-dot-fill")).toHaveCSS("opacity", "1");
    await expect(page.locator(".hero-dot:not(.hero-dot-active) .hero-dot-fill").first()).toHaveCSS(
      "opacity",
      "0",
    );
  });

  test("place la barre de commandes sous le texte, alignée sur sa colonne", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const controls = (await page.locator(".hero-controls").boundingBox())!;
    const title = (await page.locator(".hero-slide-active .hero-title").boundingBox())!;
    const actions = (await page.locator(".hero-slide-active .hero-cta").boundingBox())!;
    expect(Math.abs(controls.x + 16 - title.x)).toBeLessThanOrEqual(24);
    expect(controls.y).toBeGreaterThanOrEqual(actions.y + actions.height);
    for (const button of await page.locator(".hero-controls button").all()) {
      expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe("carrousel sur écran tactile", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test("change de diapositive au premier appui", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Afficher Galaxy S26 Ultra" }).tap();
    expect(await activeSlide(page)).toBe("s26u");
  });

  test("place les commandes sous la photo, jamais par-dessus", async ({ page }) => {
    await page.goto("/");
    const controls = (await page.locator(".hero-controls").boundingBox())!;
    const art = (await page.locator(".hero-slide-active .hero-art").boundingBox())!;
    expect(controls.y).toBeGreaterThanOrEqual(art.y + art.height - 1);
  });
});
