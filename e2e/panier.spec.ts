import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import {
  deliveryZoneOptions,
  freeDeliveryLomeFromFcfa,
  maxQuantityPerLine,
} from "../src/config/policies";
import { CART_STORAGE_KEY } from "../src/lib/cart/storage";

/**
 * Panier (PLAN §6, étape 5) sur le catalogue statique : choix de la variante et ajout depuis la
 * fiche, compteur, tiroir, page panier. Le serveur fait foi : prix, stock et frais viennent du
 * devis (`priceCart`). Aucune commande ni aucun paiement.
 */
const plain = (text: string | null) => (text ?? "").replace(/[  ]/g, " ").trim();

async function seed(page: Page, lines: unknown[], zone: string | null = null) {
  await page.goto("/mentions-legales");
  await page.evaluate(([key, value]) => window.localStorage.setItem(key, value), [
    CART_STORAGE_KEY,
    JSON.stringify({ version: 1, lines, zone }),
  ] as const);
}

async function expectTotals(page: Page) {
  await expect(page.getByTestId("totaux")).toHaveAttribute("aria-busy", "false");
  await expect(page.getByTestId("sous-total")).not.toHaveText("…");
}

test.describe("fiche produit : variante et ajout", () => {
  test("ajoute la variante choisie sans quitter la fiche, l'annonce et la conserve", async ({
    page,
  }) => {
    await page.goto("/produit/iphone-18-pro");
    // Bordeaux 256 Go est épuisé : la fiche ouvre Bordeaux 512 Go.
    await expect(page.getByRole("radio", { name: /512 Go/ })).toBeChecked();
    await page.getByRole("radio", { name: /Argent/ }).check();
    await expect(page).toHaveURL(/\?couleur=argent&stockage=256$/);
    // Bordeaux reste disponible en 512 Go : jamais « Indisponible » pour tout le coloris.
    await expect(page.getByRole("radio", { name: "Bordeaux · 512 Go seulement" })).toHaveCount(1);
    await expect(page.getByRole("group", { name: /^Coloris/ })).not.toContainText("Indisponible");
    const add = page.getByRole("button", { name: /^Ajouter au panier/ });
    await expect(add).toHaveAccessibleName("Ajouter au panier : iPhone 18 Pro (Argent · 256 Go)");
    expect((await add.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await add.click();
    await expect(page).toHaveURL(/\/produit\/iphone-18-pro/);
    await expect(page.getByRole("status").filter({ hasText: "ajouté" })).toContainText(
      "iPhone 18 Pro (Argent · 256 Go) ajouté au panier.",
    );
    await expect(page.getByRole("button", { name: "Panier, 1 article" })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("button", { name: "Panier, 1 article" })).toBeVisible();
    await page.goto("/panier");
    await expect(page.locator("[data-sku='IP18-ARG-256']")).toContainText("iPhone 18 Pro");
    await expect(page.getByTestId("quantite")).toHaveText("1");
    await expectTotals(page);
  });

  test("signale une combinaison épuisée et relit une adresse partagée", async ({ page }) => {
    await page.goto("/produit/iphone-18-pro?couleur=bordeaux&stockage=256");
    await expect(page.getByRole("radio", { name: /256 Go/ })).toBeChecked();
    await expect(page.getByText(/Cette version est épuisée/)).toBeVisible();
    const button = page.getByRole("button", { name: /^Épuisé/ });
    await expect(button).toHaveAttribute("aria-disabled", "true");
    await button.click({ force: true });
    await expect(page.getByRole("button", { name: "Panier" })).toBeVisible();
  });

  test("dit que la quantité maximale est atteinte au lieu d'ajouter à tort", async ({ page }) => {
    await seed(page, [{ sku: "IP18-BOR-512", qty: maxQuantityPerLine }]);
    await page.goto("/produit/iphone-18-pro");
    await page.getByRole("button", { name: /^Ajouter au panier/ }).click();
    await expect(page.getByText(/^Quantité maximale atteinte/)).toBeVisible();
  });
});

test.describe("page panier", () => {
  test("ignore un prix falsifié et un SKU mal formé : le serveur fait foi", async ({ page }) => {
    await seed(page, [
      { sku: "AP5-BLA", qty: 1, price_fcfa: 1 },
      { sku: "bad sku", qty: 1 },
    ]);
    await page.goto("/panier");
    await expect(page.getByText(/Une partie du panier enregistré était illisible/)).toBeVisible();
    await expect(page.locator("[data-sku]")).toHaveCount(1);
    await expectTotals(page);
    expect(plain(await page.getByTestId("sous-total").textContent())).toBe("98 000 FCFA");
  });

  test("borne la quantité au stock, garde le focus et l'annonce", async ({ page }) => {
    await seed(page, [{ sku: "RN15-NOI-256", qty: 1 }]);
    await page.goto("/panier");
    await expectTotals(page);
    const plus = page.getByRole("button", { name: /^Augmenter la quantité/ });
    await plus.click();
    await expect(page.getByTestId("quantite")).toHaveText("2");
    await expect(page.getByRole("status").filter({ hasText: /^Quantité de/ })).toHaveText(/: 2\.$/);
    await expect(plus).toHaveAttribute("aria-disabled", "true");
    await expect(plus).toBeFocused();
    await plus.click({ force: true });
    await expect(page.getByTestId("quantite")).toHaveText("2");
  });

  test("retire et explique une variante épuisée ou inconnue", async ({ page }) => {
    await seed(page, [
      { sku: "IP18-BOR-256", qty: 1 },
      { sku: "ZZZZ-INCONNU", qty: 1 },
      { sku: "AP5-BLA", qty: 1 },
    ]);
    await page.goto("/panier");
    await expect(page.getByText(/en rupture de stock : retiré du panier/)).toBeVisible();
    await expect(page.getByText(/n'est plus disponible : retiré du panier/)).toBeVisible();
    await expect(page.locator("[data-sku]")).toHaveCount(1);
    await expectTotals(page);
  });

  test("calcule les frais selon la zone et la livraison offerte à Lomé", async ({ page }) => {
    await seed(page, [{ sku: "AP5-BLA", qty: 1 }]);
    await page.goto("/panier");
    const zone = page.getByLabel("Zone de livraison");
    await zone.selectOption("lome");
    await expectTotals(page);
    expect(plain(await page.getByTestId("livraison").textContent())).toBe("1 500 FCFA");
    const missing = new Intl.NumberFormat("fr-FR").format(freeDeliveryLomeFromFcfa - 98_000);
    expect(plain(await page.getByTestId("livraison-offerte").textContent())).toBe(
      `Plus que ${plain(missing)} FCFA pour la livraison offerte.`,
    );
    expect(plain(await page.getByTestId("total").textContent())).toBe("99 500 FCFA");
    await zone.selectOption("kara");
    await expectTotals(page);
    expect(plain(await page.getByTestId("livraison").textContent())).toBe("5 000 FCFA");
    const kara = deliveryZoneOptions.find((option) => option.code === "kara")!;
    await expect(page.getByTestId("totaux")).toContainText(`${kara.label} · ${kara.eta_label}`);
    // Au-delà du seuil, la livraison à Lomé est offerte.
    await page.getByRole("button", { name: /^Augmenter la quantité/ }).click();
    await page.getByRole("button", { name: /^Augmenter la quantité/ }).click();
    await page.getByRole("button", { name: /^Augmenter la quantité/ }).click();
    await zone.selectOption("lome");
    await expectTotals(page);
    await expect(page.getByTestId("livraison")).toHaveText("Offerte");
    await expect(page.getByTestId("livraison-offerte")).toHaveCount(0);
  });

  test("l'icône de l'en-tête y est un lien vers la page courante, sans dialogue annoncé", async ({
    page,
  }) => {
    await seed(page, [{ sku: "AP5-BLA", qty: 2 }]);
    await page.goto("/panier");
    const header = page.getByRole("banner");
    const link = header.getByRole("link", { name: "Panier, 2 articles" });
    await expect(link).toHaveAttribute("aria-current", "page");
    await expect(link).not.toHaveAttribute("aria-haspopup", /.*/);
    await expect(link).not.toHaveAttribute("aria-expanded", /.*/);
    await expect(header.getByRole("button", { name: /^Panier/ })).toHaveCount(0);
  });

  test("n'offre ni commande ni paiement : la commande simulée arrive bientôt", async ({ page }) => {
    await seed(page, [{ sku: "AP5-BLA", qty: 1 }]);
    await page.goto("/panier");
    await expect(page.getByText("La commande simulée arrive bientôt.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Commander/ })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Commander|Payer/ })).toHaveCount(0);
  });

  test("retire une ligne en gardant le focus sur la page, puis vide le panier", async ({
    page,
  }) => {
    await seed(page, [
      { sku: "AP5-BLA", qty: 1 },
      { sku: "IP18-BOR-512", qty: 1 },
    ]);
    await page.goto("/panier");
    await expectTotals(page);
    await page.getByRole("button", { name: /^Retirer AirPods 5/ }).click();
    await expect(page.locator("[data-sku='IP18-BOR-512']")).toBeFocused();
    await page.getByRole("button", { name: "Vider le panier" }).click();
    const dialog = page.getByRole("dialog", { name: "Vider le panier ?" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Vider le panier" }).click();
    await expect(page.getByText("Votre panier est vide.")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Votre panier" })).toBeFocused();
    await expect(page.getByRole("link", { name: "Continuer mes achats" })).toHaveAttribute(
      "href",
      "/boutique",
    );
    await expect(page.getByTestId("totaux")).toHaveCount(0);
  });

  test("axe : aucune violation sérieuse sur la page panier remplie", async ({ page }) => {
    await seed(page, [{ sku: "AP5-BLA", qty: 1 }], "lome");
    await page.goto("/panier");
    await expectTotals(page);
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(blocking.map((v) => `${v.id} : ${v.help}`)).toEqual([]);
  });
});

test.describe("tiroir mini-panier", () => {
  test("s'ouvre depuis l'en-tête, garde le focus dedans après un retrait et le rend", async ({
    page,
  }) => {
    await seed(page, [{ sku: "AP5-BLA", qty: 1 }], "lome");
    await page.goto("/");
    const button = page.getByRole("button", { name: "Panier, 1 article" });
    await button.click();
    const dialog = page.getByRole("dialog", { name: "Votre panier" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("AirPods 5")).toBeVisible();
    await expect(dialog.getByTestId("sous-total")).not.toHaveText("…");
    // Même ligne que la page panier sous « Livraison » : zone et délai.
    const lome = deliveryZoneOptions.find((option) => option.code === "lome")!;
    await expect(dialog.getByTestId("totaux")).toContainText(`${lome.label} · ${lome.eta_label}`);

    const results = await new AxeBuilder({ page }).include("dialog").analyze();
    expect(
      results.violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .map((v) => v.id),
    ).toEqual([]);

    await dialog.getByRole("button", { name: /^Retirer AirPods 5/ }).click();
    await expect(dialog.getByText("Votre panier est vide.")).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Votre panier" })).toBeFocused();
    // Panier vide : aucun total, ni ancien ni en attente.
    await expect(dialog.getByTestId("totaux")).toHaveCount(0);
    await expect(dialog.getByRole("link", { name: "Continuer mes achats" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: "Panier" })).toBeFocused();
  });

  test("vide dès l'ouverture : état vide, sans « … » sans fin", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Panier" }).click();
    const dialog = page.getByRole("dialog", { name: "Votre panier" });
    await expect(dialog.getByText("Votre panier est vide.")).toBeVisible();
    await expect(dialog.getByText("…")).toHaveCount(0);
  });
});
