import { expect, test, type Page } from "@playwright/test";
import { brandHref, productHref, routeFor } from "../src/config/site";
import { products } from "../src/data/catalog";

/**
 * Accueil retravaillé (refonte, §3.1, lot 4) : chaque décision validée est vérifiée sur le rendu,
 * à 1440 et 390 px. Les comptes et prix attendus sont calculés à partir du catalogue.
 */
const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

const plain = (text: string | null) => (text ?? "").replace(/[  ]/g, " ").trim();

async function height(page: Page, selector: string) {
  return (await page.locator(selector).first().boundingBox())!.height;
}

test.describe("hero", () => {
  test("prix grand « Dès … FCFA », deux actions et la marque cliquable", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");
    const slide = page.locator(".hero-slide-active");
    const price = slide.locator(".hero-price [data-price]");
    expect(plain(await price.textContent())).toBe("Dès 970 000 FCFA");
    await expect(price).toHaveCSS("font-size", "28px");
    await expect(slide.getByRole("link", { name: "Voir l'iPhone 18 Pro" })).toHaveAttribute(
      "href",
      productHref("iphone-18-pro"),
    );
    await expect(slide.getByRole("link", { name: "Tout Apple" })).toHaveAttribute(
      "href",
      brandHref("apple")!,
    );
    await expect(slide.getByRole("link", { name: "Apple", exact: true })).toHaveAttribute(
      "href",
      brandHref("apple")!,
    );
    await expect(slide.getByRole("link", { name: "Comparer" })).toHaveAttribute(
      "href",
      routeFor("comparerAccueil")!,
    );
    // Le bouton principal est vert (règle 1), quel que soit le fond.
    await expect(slide.getByRole("link", { name: "Voir l'iPhone 18 Pro" })).toHaveCSS(
      "background-color",
      "rgb(0, 128, 90)",
    );
  });

  test("prix de 22 px sur téléphone et trois diapositives des trois marques", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto("/");
    await expect(page.locator(".hero-slide-active .hero-price [data-price]")).toHaveCSS(
      "font-size",
      "22px",
    );
    await expect(page.locator("[data-product-slide]")).toHaveCount(3);
    const slides = await page
      .locator("[data-product-slide]")
      .evaluateAll((elements) =>
        elements.map((element) => element.getAttribute("data-product-slide")),
      );
    expect(slides).toEqual(["ip18", "s26u", "x17u"]);
  });

  test("tient dans le premier écran du téléphone", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto("/");
    expect(await height(page, ".hero-carousel")).toBeLessThanOrEqual(740);
  });
});

test.describe("titres de section", () => {
  test("simples, sans surtitre ni point final", async ({ page }) => {
    await page.goto("/");
    const titles = (await page.locator("main h2:visible").allTextContents()).map(plain);
    for (const title of ["Nouveautés", "Parcourir par marque", "Comparer avant d’acheter"]) {
      expect(titles).toContain(title);
    }
    for (const title of titles) expect(title, title).not.toMatch(/\.$/);
    for (const id of ["nouveautes", "marques", "comparer"]) {
      await expect(page.locator(`#${id} .eyebrow`)).toHaveCount(0);
    }
  });
});

test.describe("Parcourir par marque", () => {
  test("trois cartes pastel vers les pages marque, médaillons VS entre elles", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");
    const section = page.locator("#marques");
    for (const brand of ["apple", "samsung", "xiaomi"] as const) {
      const card = section.locator(`a.brand-card[data-brand="${brand}"]`);
      await expect(card).toHaveAttribute("href", brandHref(brand)!);
      const name = brand[0]!.toUpperCase() + brand.slice(1);
      await expect(card).toContainText(`Voir ${name}`);
      const own = products.filter((product) => product.brand_slug === brand);
      const min = Math.min(...own.map((product) => product.min_price_fcfa ?? Infinity));
      expect(plain(await card.locator(".brand-card-summary").textContent())).toBe(
        `${own.length} produits · Dès ${new Intl.NumberFormat("fr-FR").format(min).replace(/\s/g, " ")} FCFA`,
      );
    }
    await expect(section.locator("[data-vs-mark]:visible")).toHaveCount(2);
    // Trois vignettes par carte, sans chevauchement.
    for (const card of await section.locator(".brand-card").all()) {
      const boxes = await card
        .locator(".brand-card-art")
        .evaluateAll((elements) =>
          elements.map((element) => element.getBoundingClientRect().toJSON() as DOMRect),
        );
      expect(boxes).toHaveLength(3);
      for (let index = 1; index < boxes.length; index += 1) {
        expect(boxes[index]!.left).toBeGreaterThanOrEqual(boxes[index - 1]!.right - 0.5);
      }
    }
  });

  test("sur téléphone, trois rangées compactes de 112 px séparées par « vs »", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto("/");
    const cards = page.locator("#marques .brand-card");
    await expect(cards).toHaveCount(3);
    for (const card of await cards.all()) {
      expect((await card.boundingBox())!.height).toBe(112);
    }
    await expect(page.locator("#marques [data-vs-mark]:visible")).toHaveCount(2);
  });
});

test.describe("tuiles", () => {
  test("trois tuiles, un prix, un bouton et un badge de marque cliquable", async ({ page }) => {
    await page.goto("/");
    const tiles = page.locator(".promo-tile");
    expect(
      await tiles.evaluateAll((elements) =>
        elements.map((element) => element.getAttribute("data-product-card")),
      ),
    ).toEqual(["a57", "app3", "rw6"]);
    for (const tile of await tiles.all()) {
      const code = await tile.getAttribute("data-product-card");
      const product = products.find((item) => item.code === code)!;
      await expect(tile.getByRole("link", { name: /^Voir le produit/ })).toHaveCount(1);
      await expect(
        tile.getByRole("link", { name: product.brand_slug, exact: false }).first(),
      ).toHaveAttribute("href", brandHref(product.brand_slug)!);
      const expected = product.max_price_fcfa !== product.min_price_fcfa ? /^Dès / : /^\d/;
      expect(plain(await tile.locator("[data-price]").textContent())).toMatch(expected);
    }
  });

  test("420 px au plus par tuile sur téléphone", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto("/");
    for (const tile of await page.locator(".promo-tile").all()) {
      expect((await tile.boundingBox())!.height).toBeLessThanOrEqual(420);
    }
  });
});

test.describe("Nouveautés", () => {
  test("pastilles et flèches sur une seule ligne à partir de 641 px", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    const group = (await page.getByRole("group", { name: "Filtrer par marque" }).boundingBox())!;
    const next = (await page.getByRole("button", { name: "Produits suivants" }).boundingBox())!;
    expect(group.height).toBeLessThanOrEqual(48);
    expect(Math.abs(group.y + group.height / 2 - (next.y + next.height / 2))).toBeLessThanOrEqual(
      2,
    );
  });

  for (const width of [360, 390]) {
    test(`à ${width} px, défilement au doigt et quatre pastilles entières, sur une ligne`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      const section = page.locator("#nouveautes");
      // Sur téléphone, les flèches ne masquent plus les pastilles : le rail défile au doigt.
      await expect(section.getByRole("button", { name: "Produits suivants" })).toBeHidden();
      await expect(section.getByRole("button", { name: "Produits précédents" })).toBeHidden();
      const group = section.getByRole("group", { name: "Filtrer par marque" });
      // Défilement vertical seulement (jamais celui de la rangée), sous l'en-tête collant.
      const top = (await group.boundingBox())!.y;
      await page.evaluate((y) => window.scrollTo(0, y - 300), top);
      const pills = await group.locator("label").all();
      expect(pills).toHaveLength(4);
      const tops = new Set<number>();
      for (const pill of pills) {
        const box = (await pill.boundingBox())!;
        tops.add(Math.round(box.y));
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
        // Entièrement visible : rien ne la recouvre en son centre ni à ses bords.
        expect(
          await pill.evaluate((label) => {
            const rect = label.getBoundingClientRect();
            const y = rect.top + rect.height / 2;
            return [rect.left + 2, rect.left + rect.width / 2, rect.right - 2].every((x) =>
              label.contains(document.elementFromPoint(x, y)),
            );
          }),
        ).toBe(true);
      }
      expect(tops.size).toBe(1);
    });
  }

  test("le lien d'en-tête suit le filtre, avec des comptes calculés", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#nouveautes");
    await expect(
      section.getByRole("link", { name: `Tout le catalogue (${products.length})` }),
    ).toHaveAttribute("href", routeFor("boutique")!);
    await section.getByRole("radio", { name: /^Samsung/ }).check();
    const samsung = products.filter((product) => product.brand_slug === "samsung").length;
    await expect(
      section.getByRole("link", { name: `Voir les ${samsung} produits Samsung` }),
    ).toHaveAttribute("href", brandHref("samsung")!);
    await expect(section.getByRole("link", { name: /Tout le catalogue/ })).toBeHidden();
    // Filtre sans JavaScript : seules les cartes Samsung restent visibles.
    const visibleBrands = await section
      .locator("[data-rail-item]:visible")
      .evaluateAll((items) => items.map((item) => item.getAttribute("data-brand")));
    expect(visibleBrands.length).toBeGreaterThan(0);
    expect(new Set(visibleBrands)).toEqual(new Set(["samsung"]));
  });

  test("présente les 10 sorties les plus récentes, cartes entières cliquables", async ({
    page,
  }) => {
    await page.goto("/");
    const latest = products
      .toSorted((a, b) => b.release_date.localeCompare(a.release_date))
      .slice(0, 10)
      .map((product) => product.code)
      .toSorted();
    const shown = await page
      .locator("#nouveautes [data-product-card]")
      .evaluateAll((elements) =>
        elements.map((element) => element.getAttribute("data-product-card")),
      );
    expect(shown.toSorted()).toEqual(latest);
  });
});

test.describe("comparateur", () => {
  test("médaillon VS dans l'en-tête et prix en première ligne", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");
    await expect(page.locator("#comparer [data-vs-mark]")).toHaveCount(1);
    const table = page.locator("#comparer table:visible");
    await expect(table.locator("tbody tr").first().locator("th")).toHaveText("Prix indicatif");
    await expect(table.locator("thead th[scope=col]")).toHaveCount(4);
  });

  test("sur téléphone : une carte par critère, valeurs empilées, montants entiers, liens", async ({
    page,
  }) => {
    await page.setViewportSize(PHONE);
    await page.goto("/");
    const table = page.locator("#comparer table:visible");
    const price = table.locator("tbody tr").first();
    const cells = await price.locator("td").all();
    expect(cells).toHaveLength(3);
    const boxes = await Promise.all(cells.map(async (cell) => (await cell.boundingBox())!));
    for (let index = 1; index < boxes.length; index += 1) {
      expect(boxes[index]!.y).toBeGreaterThan(boxes[index - 1]!.y);
    }
    // Un montant n'est jamais coupé : une seule ligne par prix.
    for (const amount of await price.locator("[data-price]").all()) {
      expect(await amount.evaluate((element) => element.getClientRects().length)).toBe(1);
    }
    // Colonne de valeurs régulière : chaque valeur finit au bord droit de sa carte, même quand
    // elle passe sous le nom du modèle.
    for (const cell of await table.locator("tbody td").all()) {
      const [value, right] = await cell.evaluate((element) => {
        const child = element.firstElementChild!;
        const box = element.getBoundingClientRect();
        const rects = [...child.getClientRects()];
        return [Math.max(...rects.map((rect) => rect.right)), box.right] as const;
      });
      expect(Math.abs(value - right)).toBeLessThanOrEqual(1);
    }
    // Un lien par modèle, le nom du modèle visible (règle 4 : le libellé dit où mène le lien).
    const links = page.locator("#comparer .compare-mobile-links:visible").getByRole("link");
    await expect(links).toHaveCount(3);
    await expect(links.first()).toHaveAttribute("href", productHref("iphone-18-pro"));
    const names = ["iPhone 18 Pro", "Galaxy S26 Ultra", "Xiaomi 17 Ultra"];
    for (const [index, name] of names.entries()) {
      await expect(links.nth(index)).toHaveAccessibleName(`Voir le produit ${name}`);
      await expect(links.nth(index).locator(".compare-link-name")).toBeVisible();
      await expect(links.nth(index).locator(".compare-link-name")).toHaveText(name);
    }
  });

  test("familles de la refonte : un produit de chaque marque", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");
    const families = [
      ["Smartphones", ["iPhone 18 Pro", "Galaxy S26 Ultra", "Xiaomi 17 Ultra"]],
      ["Écouteurs", ["AirPods Pro 3", "Galaxy Buds4 Pro", "Xiaomi Buds 6"]],
      ["Montres et bracelets", ["Apple Watch Series 12", "Galaxy Watch9", "Xiaomi Watch S5"]],
    ] as const;
    for (const [family, names] of families) {
      await page
        .getByRole("group", { name: "Choisir une catégorie" })
        .getByRole("radio", { name: family })
        .check();
      const header = page.locator("#comparer table:visible thead");
      for (const name of names) await expect(header).toContainText(name);
    }
  });
});

test.describe("réassurance", () => {
  test("trois éléments, chacun marqué simulé ou indicatif", async ({ page }) => {
    await page.goto("/");
    const items = page.getByRole("region", { name: "Nos engagements" }).getByRole("listitem");
    await expect(items).toHaveCount(3);
    expect(await items.locator("h3").allTextContents()).toEqual([
      "Livraison",
      "Paiement",
      "Garantie",
    ]);
    for (const item of await items.all()) await expect(item).toContainText(/simulé|indicati/);
  });
});

test("la page tient sous 7 000 px de haut sur téléphone", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto("/");
  const total = await page.locator("body").evaluate((body) => body.scrollHeight);
  expect(total).toBeLessThanOrEqual(7000);
});

test.describe("filtres sans JavaScript (refonte §4.7)", () => {
  test.use({ javaScriptEnabled: false });

  test("le rail et le comparateur filtrent sans JavaScript", async ({ page }) => {
    await page.goto("/");
    const rail = page.locator("#nouveautes");
    await rail.getByRole("radio", { name: /^Xiaomi/ }).check();
    const brands = await rail
      .locator("[data-rail-item]:visible")
      .evaluateAll((items) => items.map((item) => item.getAttribute("data-brand")));
    expect(new Set(brands)).toEqual(new Set(["xiaomi"]));
    const compare = page.locator("#comparer");
    await compare.getByRole("radio", { name: "Écouteurs" }).check();
    await expect(compare.locator("table:visible")).toHaveCount(1);
    await expect(compare.locator("table:visible thead")).toContainText("AirPods Pro 3");
  });
});
