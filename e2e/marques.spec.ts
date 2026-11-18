import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { brands, categories, products } from "../src/data/catalog";
import { productCount } from "../src/lib/catalog/summary";

/**
 * Pages marque (refonte, lot 3) : « la section Samsung mène vers des produits Samsung
 * seulement ». Toutes les attentes sont calculées à partir du catalogue, jamais écrites en dur.
 */

const brandPath = (slug: string) => `/marques/${slug}`;

/**
 * Éléments marqués « page courante » (`aria-current="page"`), et s'ils sont affichés (ni
 * `display: none`, ni dialogue fermé). Les points du carrousel de l'accueil portent
 * `aria-current="true"` (diapositive affichée) : autre sens, hors de cette règle.
 */
async function currentMarks(page: Page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('[aria-current="page"]'), (element) => ({
      tag: element.tagName.toLowerCase(),
      value: element.getAttribute("aria-current"),
      href: element.getAttribute("href"),
      visible: element.checkVisibility({ visibilityProperty: true }),
      inDialog: Boolean(element.closest("dialog")),
      inHeader: Boolean(element.closest("header")),
      pathname: location.pathname,
    })),
  );
}

async function blockingViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id} : ${v.help} (${v.nodes.length})`);
}

for (const brand of brands) {
  const expected = products.filter((product) => product.brand_slug === brand.slug);
  const codes = expected.map((product) => product.code).toSorted();
  const names = new Set(expected.map((product) => product.name));
  const path = brandPath(brand.slug);

  test.describe(`page ${path}`, () => {
    test(`n'affiche que les ${expected.length} produits ${brand.name}`, async ({ page }) => {
      expect(expected, "10 produits par marque (lot 1)").toHaveLength(10);
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1, name: brand.name })).toBeVisible();

      const main = page.locator("main");
      const cards = main.locator("[data-product-card]");
      await expect(cards).toHaveCount(expected.length);
      // Contrôle par data-product : chaque visuel et chaque carte de la page est de la marque.
      const marks = await main.locator("[data-product], [data-product-card]").evaluateAll((els) =>
        els.map((el) => ({
          code: el.getAttribute("data-product") ?? el.getAttribute("data-product-card"),
          brand: el.getAttribute("data-brand"),
        })),
      );
      expect(marks.length).toBeGreaterThanOrEqual(expected.length);
      for (const mark of marks) {
        expect(mark.brand, JSON.stringify(mark)).toBe(brand.slug);
        expect(codes, JSON.stringify(mark)).toContain(mark.code);
      }
      const cardCodes = await cards.evaluateAll((els) =>
        els.map((el) => el.getAttribute("data-product-card")),
      );
      expect(cardCodes.toSorted()).toEqual(codes);

      // Contrôle par nom : la marque affichée et le nom du produit de chaque carte.
      for (const card of await cards.all()) {
        await expect(card.locator("[data-card-brand]")).toHaveText(brand.name);
        expect(names).toContain((await card.locator("h3").textContent())?.trim());
      }

      // Compte calculé dans le bandeau et dans la description.
      await expect(page.locator("[data-brand-summary]")).toContainText(
        productCount(expected.length),
      );
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        new RegExp(productCount(expected.length)),
      );
      await expect(main).toContainText("Prix indicatifs, boutique fictive");
    });

    test("barre de catégories : comptes calculés, catégorie vide masquée", async ({ page }) => {
      await page.goto(path);
      const bar = page.getByRole("navigation", { name: `Catégories ${brand.name}` });
      await expect(bar.getByRole("link", { name: /^Tout/ })).toContainText(String(expected.length));
      for (const category of categories) {
        const count = expected.filter((p) => p.category_slug === category.slug).length;
        const link = bar.getByRole("link", { name: new RegExp(`^${category.name}`) });
        const section = page.locator(`section#${category.slug}`);
        if (count === 0) {
          await expect(link).toHaveCount(0);
          await expect(section).toHaveCount(0);
        } else {
          await expect(link).toHaveAttribute("href", `#${category.slug}`);
          await expect(link).toContainText(String(count));
          await expect(section.locator("[data-product-card]")).toHaveCount(count);
        }
      }
    });

    test("« Comparer avec » et « Voir aussi » mènent aux deux autres marques", async ({ page }) => {
      await page.goto(path);
      const others = brands.filter((other) => other.slug !== brand.slug);
      const seeAlso = page.getByRole("navigation", { name: "Voir aussi" });
      for (const other of others) {
        const count = products.filter((p) => p.brand_slug === other.slug).length;
        const link = seeAlso.getByRole("link", { name: new RegExp(`^${other.name}`) });
        await expect(link).toHaveAttribute("href", brandPath(other.slug));
        await expect(link).toContainText(productCount(count));
      }
      const compare = page.getByRole("region", { name: "Comparer avec" });
      await expect(compare.getByRole("link")).toHaveCount(2);
      for (const other of others) {
        await expect(compare).toContainText(other.name);
      }
    });

    test("une seule image prioritaire", async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('link[rel="preload"][as="image"]')).toHaveCount(1);
      await expect(page.locator('img[fetchpriority="high"], img[loading="eager"]')).toHaveCount(1);
    });

    for (const width of [375, 1440]) {
      test(`axe : aucune violation sérieuse à ${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        expect(await blockingViolations(page)).toEqual([]);
        const region = await new AxeBuilder({ page }).withRules(["region"]).analyze();
        expect(region.violations.flatMap((v) => v.nodes.map((n) => n.target.join(" ")))).toEqual(
          [],
        );
      });
    }

    for (const width of [360, 390, 412]) {
      test(`cartes lisibles à ${width} px : nom sur 2 lignes au plus, prix entier`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        // Mesures avec les polices du site, pas celles de repli.
        await expect(page.locator("main [data-product-card]")).toHaveCount(expected.length);
        await page.evaluate(() => document.fonts.ready);
        const cards = await page.locator("main [data-product-card]").evaluateAll((els) =>
          els.map((card) => {
            const box = card.getBoundingClientRect();
            const h3 = card.querySelector("h3")!;
            const price = card.querySelector("[data-price]")!.getBoundingClientRect();
            const style = getComputedStyle(card);
            return {
              code: card.getAttribute("data-product-card"),
              height: box.height,
              nameLines: Math.round(
                h3.getBoundingClientRect().height / parseFloat(getComputedStyle(h3).lineHeight),
              ),
              priceInside:
                price.left >= box.left + parseFloat(style.paddingLeft) - 0.5 &&
                price.right <= box.right - parseFloat(style.paddingRight) + 0.5,
            };
          }),
        );
        expect(cards).toHaveLength(expected.length);
        for (const card of cards) {
          expect(card.nameLines, JSON.stringify(card)).toBeLessThanOrEqual(2);
          expect(card.priceInside, JSON.stringify(card)).toBe(true);
          // Liste (< 400 px) ou grille de 2 colonnes compacte (≥ 400 px) : une paire de cartes
          // tient dans un écran de téléphone (avant : 635 px de haut par carte à 412 px).
          expect(card.height, JSON.stringify(card)).toBeLessThanOrEqual(width < 400 ? 220 : 400);
        }
      });
    }

    test("liste à 375 px : catégorie et coloris de chaque carte", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(path);
      for (const product of expected) {
        const card = page.locator(`main [data-product-card="${product.code}"]`);
        const category = categories.find((c) => c.slug === product.category_slug)!;
        await expect(card.locator("[data-card-category]")).toHaveText(category.name);
        const colors = new Set(
          product.variants.filter((v) => v.is_active).map((v) => v.color_slug),
        );
        const dots = card.locator("[data-card-swatches] > [aria-hidden]:not(.tabular-nums)");
        await expect(dots).toHaveCount(Math.min(colors.size, 4));
        await expect(card.locator("[data-card-swatches] .sr-only")).toContainText("coloris :");
        await expect(dots.first()).toBeVisible();
      }
    });

    test("« Voir le produit », jamais « Acheter » (pas de panier)", async ({ page }) => {
      await page.goto(path);
      const main = page.locator("main");
      await expect(main.getByText("Acheter", { exact: true })).toHaveCount(0);
      for (const product of expected) {
        await expect(
          main.getByRole("link", { name: `Voir le produit ${product.name}`, exact: true }),
        ).toHaveAttribute("href", `/produit/${product.slug}`);
      }
    });

    test("à 1440 px, le produit phare de chaque section occupe une grande carte", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path);
      for (const section of await page.locator("main section[id]").all()) {
        const cards = section.locator("[data-product-card]");
        if ((await cards.count()) === 0) continue;
        const first = (await cards.first().boundingBox())!;
        await expect(cards.first()).toHaveAttribute("data-featured", "");
        await expect(section.locator("[data-featured]")).toHaveCount(1);
        if ((await cards.count()) > 1) {
          const second = (await cards.nth(1).boundingBox())!;
          expect(first.width).toBeGreaterThan(second.width * 1.9);
          expect(Math.abs(first.height - second.height)).toBeLessThanOrEqual(1);
        }
      }
    });

    for (const width of [320, 360, 390]) {
      test(`pas de défilement horizontal à ${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(path);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  });
}

test.describe("chaque lien « Samsung » mène à /marques/samsung", () => {
  const target = /\/marques\/samsung$/;

  async function expectSamsungPage(page: Page) {
    await expect(page).toHaveURL(target);
    await expect(page.getByRole("heading", { level: 1, name: "Samsung" })).toBeVisible();
  }

  test("en-tête (1440 px)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Navigation principale" })
      .getByRole("link", { name: "Samsung", exact: true })
      .click();
    await expectSamsungPage(page);
  });

  test("menu mobile (375 px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await dialog.getByRole("link", { name: "Samsung", exact: true }).click();
    await expectSamsungPage(page);
    await expect(dialog).toBeHidden();
  });

  test("pied de page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("contentinfo").getByRole("link", { name: "Samsung", exact: true }).click();
    await expectSamsungPage(page);
  });

  test("carte de marque de l'accueil", async ({ page }) => {
    await page.goto("/");
    const card = page.locator('#marques a[data-brand="samsung"]');
    await expect(card).toHaveAttribute("href", "/marques/samsung");
    await card.click();
    await expectSamsungPage(page);
  });

  test("nom de marque d'une fiche Samsung", async ({ page }) => {
    const product = products.find((p) => p.brand_slug === "samsung")!;
    await page.goto(`/produit/${product.slug}`);
    await page.getByRole("main").getByRole("link", { name: "Samsung", exact: true }).click();
    await expectSamsungPage(page);
  });

  test("raccourci de la boutique", async ({ page }) => {
    await page.goto("/boutique");
    await page
      .getByRole("navigation", { name: "Marques" })
      .getByRole("link", { name: "Samsung", exact: true })
      .click();
    await expectSamsungPage(page);
  });
});

test.describe("marque inconnue", () => {
  for (const slug of ["inconnue", `inconnue-${Date.now().toString(36)}`]) {
    test(`/marques/${slug.replace(/-.*/, "-…")} répond 404 dès la première visite`, async ({
      request,
    }) => {
      const response = await request.get(brandPath(slug));
      expect(response.status()).toBe(404);
      expect(await response.text()).toContain("Page introuvable");
    });
  }
});

test.describe("page courante : un seul aria-current, jamais sur une ancre", () => {
  const PAGES = ["/", "/boutique", "/marques/samsung", "/produit/galaxy-s26-ultra", "/livraison"];

  for (const width of [375, 1440]) {
    for (const path of PAGES) {
      test(`${path} à ${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        const marks = await currentMarks(page);
        for (const mark of marks) {
          expect(mark.tag, JSON.stringify(mark)).toBe("a");
          expect(mark.value).toBe("page");
          expect(mark.href, "jamais sur une ancre").not.toContain("#");
          expect(mark.href).toBe(mark.pathname);
        }
        // Aucune ancre n'est marquée, quel que soit le type d'aria-current.
        await expect(page.locator('a[aria-current][href*="#"]')).toHaveCount(0);
        // Un seul exposé : l'en-tête et le menu mobile ne sont jamais affichés ensemble.
        expect(
          marks.filter((mark) => mark.visible).length,
          JSON.stringify(marks),
        ).toBeLessThanOrEqual(1);
      });
    }
  }

  test("sur /marques/samsung (1440 px), seul « Samsung » de l'en-tête est marqué", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/marques/samsung");
    const visible = (await currentMarks(page)).filter((mark) => mark.visible);
    expect(visible).toHaveLength(1);
    expect(visible[0]).toMatchObject({ href: "/marques/samsung", inHeader: true, inDialog: false });
    // Le pied de page ne double pas la navigation principale.
    await expect(
      page.getByRole("contentinfo").getByRole("link", { name: "Samsung", exact: true }),
    ).not.toHaveAttribute("aria-current");
  });

  test("sur /boutique (1440 px), aucune ancre de catégorie n'est marquée", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/boutique");
    await expect(page.locator('a[aria-current][href*="#"]')).toHaveCount(0);
    const visible = (await currentMarks(page)).filter((mark) => mark.visible);
    expect(visible.map((mark) => mark.href)).toEqual(["/boutique"]);
  });

  test("menu mobile ouvert sur /marques/samsung : un seul lien marqué", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/marques/samsung");
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Samsung", exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
    const visible = (await currentMarks(page)).filter((mark) => mark.visible);
    expect(visible).toHaveLength(1);
    expect(visible[0]?.inDialog).toBe(true);
  });
});

test("le styleguide montre les composants des pages marque", async ({ page }) => {
  await page.goto("/styleguide#pages-marque");
  const section = page.locator("#pages-marque");
  for (const name of [
    "Breadcrumb · fil d'Ariane",
    "BrandSwitcher · Apple vs Samsung vs Xiaomi",
    "CategoryBar · Apple (catégorie vide masquée)",
  ]) {
    await expect(section.getByRole("heading", { level: 3, name })).toBeVisible();
  }
  const bar = section.getByRole("navigation", { name: "Catégories Apple (exemple)" });
  await expect(bar.getByRole("link")).toHaveCount(4);
  await expect(bar.getByRole("link", { name: /Bracelets/ })).toHaveCount(0);
});

test.describe("sélecteur « Apple vs Samsung vs Xiaomi » sur téléphone", () => {
  for (const width of [360, 390, 412]) {
    for (const brand of brands) {
      test(`${brand.slug} à ${width} px : une seule ligne, aucun « VS » en début de ligne`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(brandPath(brand.slug));
        const nav = page.getByRole("navigation", { name: "Changer de marque" });
        const items = nav.locator("li > *");
        // Attente explicite (evaluateAll n'attend pas) et polices du site chargées.
        await expect(items).toHaveCount(brands.length * 2 - 1);
        await page.evaluate(() => document.fonts.ready);
        const centers = await items.evaluateAll((els) =>
          els.map((el) => {
            const box = el.getBoundingClientRect();
            return Math.round(box.top + box.height / 2);
          }),
        );
        expect(centers).toHaveLength(brands.length * 2 - 1);
        for (const center of centers) expect(Math.abs(center - centers[0]!)).toBeLessThanOrEqual(1);
      });
    }
  }
});

/** Attend la fin d'un défilement (doux sans mouvement réduit) : 5 images sans mouvement. */
async function scrollSettled(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let last = window.scrollY;
        let still = 0;
        const tick = () => {
          still = window.scrollY === last ? still + 1 : 0;
          last = window.scrollY;
          if (still >= 5) resolve();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
  );
}

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  test(`Maj+Tab dans les sections : aucun lien sous la barre collante (WCAG 2.4.11, mouvement ${reducedMotion})`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/marques/samsung");
    const bar = page.getByRole("navigation", { name: "Catégories Samsung" });
    // Départ : premier lien après les sections (« Comparer avec »), puis remontée au clavier.
    await page.getByRole("region", { name: "Comparer avec" }).getByRole("link").first().focus();
    await scrollSettled(page);
    const cards = await page.locator("main [data-product-card]").count();
    let checked = 0;
    for (let step = 0; step < cards + 2; step += 1) {
      await page.keyboard.press("Shift+Tab");
      await scrollSettled(page);
      const focused = page.locator(":focus");
      const inGrid = await focused.evaluate((el) => Boolean(el.closest("[data-product-card]")));
      if (!inGrid) continue;
      const barBox = (await bar.boundingBox())!;
      const box = (await focused.boundingBox())!;
      expect(box.y, `lien ${step} sous la barre`).toBeGreaterThanOrEqual(barBox.y + barBox.height);
      expect(box.y + box.height, `lien ${step} hors de l'écran`).toBeLessThanOrEqual(900);
      checked += 1;
    }
    expect(checked).toBe(cards);
  });
}
