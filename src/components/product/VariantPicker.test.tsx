import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { products } from "@/data/catalog";
import { Price } from "@/components/ui/Price";
import { getCartSnapshot, updateCart } from "@/lib/cart/cart-store";
import { initialVariant, variantViews } from "@/lib/catalog/variant-options";
import { VariantPicker } from "./VariantPicker";

const iphone = products.find((product) => product.code === "ip18")!;
const variants = iphone.variants.filter((variant) => variant.is_active);

// Comme ProductView : vues calculées par le serveur, prix rendu par <Price>.
const views = variantViews(iphone.name, variants).map((view) => ({
  ...view,
  price: <Price amount={view.price_fcfa} size="lead" />,
}));

function renderPicker() {
  return render(
    <VariantPicker
      views={views}
      initialSku={initialVariant(variants).sku}
      cartHref="/panier"
      buttonClassName="bouton"
    />,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  updateCart({ type: "clear" });
  window.history.replaceState(null, "", "/produit/iphone-18-pro");
});

describe("VariantPicker", () => {
  it("expose un groupe de radios nommé par critère, la variante en stock cochée d'abord", () => {
    renderPicker();
    const color = screen.getByRole("group", { name: /^Coloris/ });
    const storage = screen.getByRole("group", { name: /^Capacité/ });
    // Bordeaux 256 Go est épuisé : la fiche s'ouvre sur Bordeaux 512 Go.
    expect(within(color).getByRole("radio", { name: /Bordeaux/ })).toHaveProperty("checked", true);
    expect(within(storage).getByRole("radio", { name: /512 Go/ })).toHaveProperty("checked", true);
    expect(within(storage).getByRole("radio", { name: /256 Go ?· Indisponible/ })).toBeTruthy();
    expect(screen.getByTestId("prix-variante").textContent).toMatch(/FCFA$/);
  });

  it("ne dit pas « Indisponible » d'un coloris disponible dans une autre capacité", async () => {
    const user = userEvent.setup();
    renderPicker();
    await user.click(screen.getByRole("radio", { name: /Noir/ }));
    const color = screen.getByRole("group", { name: /^Coloris/ });
    // Bordeaux 256 Go est épuisé, Bordeaux 512 Go ne l'est pas.
    const bordeaux = within(color).getByRole("radio", { name: /Bordeaux/ });
    expect(bordeaux.closest("label")?.textContent).toBe("Bordeaux · 512 Go seulement");
    expect(within(color).queryByText(/Indisponible/)).toBeNull();
  });

  it("annonce le prix et le stock de la variante choisie dans une région déjà montée", async () => {
    const user = userEvent.setup();
    renderPicker();
    const region = screen.getByTestId("prix-variante").closest("[role=status]")!;
    expect(region).toBeTruthy();
    await user.click(screen.getByRole("radio", { name: /256 Go/ }));
    // Même nœud : la région n'est pas recréée, son contenu change (annonce polie).
    expect(screen.getByTestId("prix-variante").closest("[role=status]")).toBe(region);
    expect(region.textContent).toMatch(/Cette version est épuisée/);
  });

  it("change le prix et le texte de stock avec la variante", async () => {
    const user = userEvent.setup();
    renderPicker();
    const argent = views.find((view) => view.sku.startsWith("IP18-ARG"))!;
    await user.click(screen.getByRole("radio", { name: /Argent/ }));
    expect(screen.getByText(argent.status)).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Ajouter au panier/ }).className).toBe("bouton");
  });

  it("met l'adresse à jour et explique une combinaison épuisée", async () => {
    const user = userEvent.setup();
    renderPicker();
    await user.click(screen.getByRole("radio", { name: /256 Go/ }));
    expect(window.location.search).toBe("?couleur=bordeaux&stockage=256");
    expect(screen.getByText(/Cette version est épuisée/)).toBeTruthy();
    const button = screen.getByRole("button", { name: /^Épuisé/ });
    expect(button.getAttribute("aria-disabled")).toBe("true");
    await user.click(button);
    expect(getCartSnapshot().lines).toEqual([]);
  });

  it("relit une adresse partagée après l'hydratation", () => {
    window.history.replaceState(null, "", "/produit/iphone-18-pro?couleur=argent&stockage=256");
    renderPicker();
    expect(screen.getByRole("radio", { name: /Argent/ })).toHaveProperty("checked", true);
  });
});

describe("AddToCartButton (dans VariantPicker)", () => {
  it("ajoute la variante choisie sans quitter la fiche et l'annonce", async () => {
    const user = userEvent.setup();
    renderPicker();
    const status = screen
      .getAllByRole("status")
      .find((region) => !region.querySelector("[data-testid=prix-variante]"))!;
    expect(status.textContent).toBe("");
    await user.click(
      screen.getByRole("button", {
        name: /^Ajouter au panier ?: iPhone 18 Pro \(Bordeaux · 512 Go\)$/,
      }),
    );
    expect(getCartSnapshot().lines).toEqual([{ sku: "IP18-BOR-512", qty: 1 }]);
    expect(status.textContent).toContain("iPhone 18 Pro (Bordeaux · 512 Go) ajouté au panier.");
    expect(within(status).getByRole("link", { name: "Voir le panier" }).getAttribute("href")).toBe(
      "/panier",
    );
  });

  it("annonce la quantité maximale au lieu d'un faux ajout", async () => {
    const user = userEvent.setup();
    updateCart({ type: "add", sku: "IP18-BOR-512", qty: 5 });
    renderPicker();
    await user.click(screen.getByRole("button", { name: /^Ajouter au panier/ }));
    expect(screen.getByText(/^Quantité maximale atteinte/)).toBeTruthy();
  });
});
