import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { countLabel } from "./count-label";
import { IconButton } from "./IconButton";

describe("countLabel", () => {
  it("ajoute le compteur au libellé, accordé en nombre", () => {
    expect(countLabel("Panier", 1)).toBe("Panier, 1 article");
    expect(countLabel("Panier", 3)).toBe("Panier, 3 articles");
    expect(countLabel("Comparateur", 2, ["produit", "produits"])).toBe("Comparateur, 2 produits");
  });

  it("garde le libellé seul sans compteur ou à zéro", () => {
    expect(countLabel("Panier", undefined)).toBe("Panier");
    expect(countLabel("Panier", 0)).toBe("Panier");
  });
});

describe("IconButton", () => {
  it("donne au bouton un nom accessible avec le compteur et une région aria-live", () => {
    const { container } = render(<IconButton label="Panier" icon="cart" count={3} />);
    expect(screen.getByRole("button", { name: "Panier, 3 articles" })).toBeTruthy();
    expect(container.querySelector('[aria-live="polite"]')?.textContent).toBe("Panier, 3 articles");
    // La pastille visuelle est masquée aux lecteurs d'écran.
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it("rend un lien quand href est fourni", () => {
    render(<IconButton label="Mon compte" icon="account" href="/mentions-legales" />);
    expect(screen.getByRole("link", { name: "Mon compte" }).getAttribute("href")).toBe(
      "/mentions-legales",
    );
  });

  it("n'affiche pas de pastille à zéro", () => {
    const { container } = render(<IconButton label="Panier" icon="cart" count={0} />);
    expect(container.querySelector(".anim-bump")).toBeNull();
  });
});
