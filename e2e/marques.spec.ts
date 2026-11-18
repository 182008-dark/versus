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
