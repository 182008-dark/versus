import { expect, test, type Page } from "@playwright/test";

/**
 * Carrousel du hero (critères de l'étape 3, §4.5) : une seule horloge (la barre de progression),
 * pauses au survol, au focus et onglet caché, bouton de rotation (WCAG 2.2.2), flèches du
 * clavier, aucun défilement sous mouvement réduit.
 *
 * Pour garder des tests courts, la plupart raccourcissent la durée d'une diapositive à
 * SHORT_MS (variable CSS `--hero-interval`, la seule source de la durée) ; le premier test
 * vérifie la durée réelle de 6 s.
 */

const SHORT_MS = 1500;
const HERO = ".hero-carousel";

async function activeSlide(page: Page) {
  return page.locator(".hero-slide-active").getAttribute("data-product-slide");
}

/** Raccourcit la durée d'une diapositive (règle !important, plus forte que le style en ligne). */
async function shortenInterval(page: Page) {
  await page.addInitScript((ms) => {
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = `.hero-carousel { --hero-interval: ${ms}ms !important; }`;
      document.head.append(style);
    });
  }, SHORT_MS);
}

/** Ouvre l'accueil et attend que le carrousel soit interactif (rotation armée). */
async function openHome(page: Page) {
  await page.mouse.move(0, 0);
  await page.goto("/");
  await expect(page.locator(HERO)).toHaveAttribute("data-autoplay", "");
  expect(await activeSlide(page)).toBe("ip18");
}

/** Temps écoulé de l'animation de la barre active (ms), `null` sans animation. */
async function progress(page: Page) {
  return page
    .locator(".hero-dot-active .hero-dot-fill")
    .evaluate((element) => Number(element.getAnimations()[0]?.currentTime ?? Number.NaN));
}

test.describe("carrousel du hero", () => {
  test("change de diapositive toutes les 6 secondes sans interaction", async ({ page }) => {
    await openHome(page);
    const start = Date.now();
    await expect.poll(() => activeSlide(page), { timeout: 9_000 }).toBe("gw9");
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThan(4_500);
    expect(elapsed).toBeLessThan(7_500);
  });

  test("la fin de la barre et le changement de diapositive sont simultanés", async ({ page }) => {
    await shortenInterval(page);
    await openHome(page);
    // Horodatage de la fin de l'animation « fill » et du changement de diapositive.
    const gap = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let ended = 0;
          document.addEventListener(
            "animationend",
            (event) => {
              if (event.animationName === "fill") ended = performance.now();
            },
            { capture: true, once: true },
          );
          const observer = new MutationObserver(() => {
            if (!document.querySelector("[data-product-slide='gw9'].hero-slide-active")) return;
            observer.disconnect();
            resolve(performance.now() - ended);
          });
          observer.observe(document.querySelector(".hero-slides")!, {
            attributes: true,
            subtree: true,
            attributeFilter: ["class"],
          });
        }),
    );
    expect(gap).toBeGreaterThanOrEqual(0);
    expect(gap).toBeLessThan(150);
  });

  test("se met en pause au survol, garde sa barre, puis reprend là où elle était", async ({
    page,
  }) => {
    await shortenInterval(page);
    await openHome(page);
    await page.waitForTimeout(SHORT_MS / 2);
    await page.locator(HERO).hover({ position: { x: 200, y: 120 } });
    await expect(page.locator(HERO)).toHaveAttribute("data-paused", "");
    const before = await progress(page);
    await page.waitForTimeout(SHORT_MS * 2.5);
    expect(await activeSlide(page)).toBe("ip18");
    // Barre figée, ni remise à zéro ni avancée.
    expect(Math.abs((await progress(page)) - before)).toBeLessThan(50);
    await page.mouse.move(0, 0);
    await expect(page.locator(HERO)).not.toHaveAttribute("data-paused", "");
    const resumed = Date.now();
    await expect.poll(() => activeSlide(page)).toBe("gw9");
    // Reprise du temps restant (environ la moitié), pas d'une diapositive entière.
    expect(Date.now() - resumed).toBeLessThan(SHORT_MS);
  });

  test("se met en pause quand le focus est dans le carrousel", async ({ page }) => {
    await shortenInterval(page);
    await openHome(page);
    await page.getByRole("button", { name: "Afficher iPhone 18 Pro" }).focus();
    await expect(page.locator(HERO)).toHaveAttribute("data-paused", "");
    await page.waitForTimeout(SHORT_MS * 2.5);
    expect(await activeSlide(page)).toBe("ip18");
    // Rotation suspendue : les changements sont annoncés poliment.
    await expect(page.locator(".hero-slides")).toHaveAttribute("aria-live", "polite");
    await page.locator("body").evaluate(() => (document.activeElement as HTMLElement).blur());
    await expect.poll(() => activeSlide(page), { timeout: SHORT_MS * 3 }).toBe("gw9");
  });

  test("se met en pause quand l'onglet est caché", async ({ page }) => {
    await shortenInterval(page);
    await openHome(page);
    const setHidden = (hidden: boolean) =>
      page.evaluate((value) => {
        Object.defineProperty(document, "hidden", { configurable: true, get: () => value });
        Object.defineProperty(document, "visibilityState", {
          configurable: true,
          get: () => (value ? "hidden" : "visible"),
        });
        document.dispatchEvent(new Event("visibilitychange"));
      }, hidden);
    await setHidden(true);
    await expect(page.locator(HERO)).toHaveAttribute("data-paused", "");
    await page.waitForTimeout(SHORT_MS * 2.5);
    expect(await activeSlide(page)).toBe("ip18");
    await setHidden(false);
    await expect.poll(() => activeSlide(page), { timeout: SHORT_MS * 3 }).toBe("gw9");
  });

  test("le bouton de rotation arrête le défilement jusqu'à ce qu'on le relance", async ({
    page,
  }) => {
    await shortenInterval(page);
    await openHome(page);
    await page.getByRole("button", { name: "Mettre en pause le défilement" }).click();
    await page.mouse.move(0, 0);
    await page.locator("body").evaluate(() => (document.activeElement as HTMLElement).blur());
    await expect(page.locator(HERO)).toHaveAttribute("data-stopped", "");
    await page.waitForTimeout(SHORT_MS * 2.5);
    expect(await activeSlide(page)).toBe("ip18");
    await page.getByRole("button", { name: "Lancer le défilement" }).click();
    await page.mouse.move(0, 0);
    await page.locator("body").evaluate(() => (document.activeElement as HTMLElement).blur());
    await expect.poll(() => activeSlide(page), { timeout: SHORT_MS * 3 }).toBe("gw9");
  });

  test("les flèches du clavier changent de diapositive", async ({ page }) => {
    await openHome(page);
    await page.getByRole("button", { name: "Afficher iPhone 18 Pro" }).focus();
    await page.keyboard.press("ArrowRight");
    expect(await activeSlide(page)).toBe("gw9");
    await page.keyboard.press("ArrowLeft");
    expect(await activeSlide(page)).toBe("ip18");
    await page.keyboard.press("ArrowLeft");
    expect(await activeSlide(page)).toBe("rn15");
    // Le focus suit la commande, la diapositive affichée est annoncée par aria-current.
    await expect(page.getByRole("button", { name: "Afficher Redmi Note 15 Pro+" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  test("le premier clic sur un point change la diapositive", async ({ page }) => {
    await openHome(page);
    await page.getByRole("button", { name: "Afficher Galaxy Watch9" }).click();
    expect(await activeSlide(page)).toBe("gw9");
  });

  test("ne défile pas et garde tout le texte visible sous mouvement réduit", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.mouse.move(0, 0);
    await page.goto("/");
    await expect(page.locator(".hero-slide-active h2")).toHaveText("iPhone 18 Pro");
    await page.waitForTimeout(7_000);
    expect(await activeSlide(page)).toBe("ip18");
    await expect(page.locator(HERO)).not.toHaveAttribute("data-autoplay", "");
    for (const element of await page.locator(".hero-slide-active .hero-text > *").all()) {
      await expect(element).toBeVisible();
      await expect(element).toHaveCSS("opacity", "1");
    }
    // Pas de rotation, donc pas de bouton de rotation ; le point actif reste visible (barre pleine).
    await expect(page.getByRole("button", { name: /défilement/ })).toHaveCount(0);
    await expect(page.locator(".hero-dot-active .hero-dot-fill")).toHaveCSS("transform", "none");
  });
});

test.describe("carrousel sur écran tactile", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test("le premier appui sur un point change la diapositive", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(HERO)).toHaveAttribute("data-autoplay", "");
    await page.getByRole("button", { name: "Afficher Galaxy Watch9" }).tap();
    expect(await activeSlide(page)).toBe("gw9");
    // Le toucher ne laisse pas de « survol » collé : seule la sortie du focus compte.
    await page.locator("body").evaluate(() => (document.activeElement as HTMLElement).blur());
    await expect(page.locator(HERO)).not.toHaveAttribute("data-paused", "");
  });
});
