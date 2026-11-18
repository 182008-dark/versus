import { expect, test } from "@playwright/test";

/**
 * Critère de l'étape 3 : aucune erreur d'hydratation. On écoute la console (toute erreur, et
 * tout avertissement qui parle d'hydratation) et les erreurs de page sur les pages livrées, le
 * temps que l'hydratation et les îlots client (carrousel, rail, menu) aient tourné.
 * En production, React signale un écart d'hydratation par une erreur minifiée (#418, #423, #425).
 */
const PAGES = [
  "/",
  "/boutique",
  "/marques/samsung",
  "/produit/iphone-18-pro",
  "/produit/galaxy-buds4",
  "/panier",
];
const HYDRATION = /hydrat|did not match|server rendered|#418|#423|#425/i;

for (const path of PAGES) {
  test(`aucune erreur ni avertissement d'hydratation sur ${path}`, async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (message) => {
      const text = message.text();
      if (message.type() === "error" || (message.type() === "warning" && HYDRATION.test(text))) {
        problems.push(`console.${message.type()} : ${text}`);
      }
    });
    page.on("pageerror", (error) => problems.push(`pageerror : ${error.message}`));

    await page.goto(path);
    await page.waitForLoadState("networkidle");
    // Laisse aux effets post-hydratation (carrousel, rail) le temps de s'exécuter.
    await page.waitForTimeout(1_000);
    expect(problems).toEqual([]);
  });
}

test("le test détecte bien une erreur d'hydratation (contrôle du contrôle)", async ({ page }) => {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });
  // Modifie un texte du HTML serveur avant l'hydratation : React doit signaler l'écart.
  await page.route("/", async (route) => {
    const response = await route.fetch();
    // Premier titre seulement (le HTML précède la charge utile RSC, qui garde le texte d'origine).
    const html = (await response.text()).replace(">Parcourir par marque<", ">Texte modifié<");
    await route.fulfill({ response, body: html });
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect.poll(() => problems.some((text) => HYDRATION.test(text))).toBe(true);
});
