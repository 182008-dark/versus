import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { products } from "@/data/catalog";
import { colorSwatches } from "@/lib/catalog/brand-page";
import { ProductCard } from "./ProductCard";

function card(code: string) {
  const product = products.find((p) => p.code === code);
  if (!product) throw new Error(code);
  const { container } = render(<ProductCard product={{ ...product, is_new: false }} />);
  const price = container.querySelector("[data-price]");
  if (!price) throw new Error("Prix absent");
  return price.textContent;
}

describe("ProductCard", () => {
  it("n'affiche pas « Dès » pour un produit à prix unique, comme la fiche", () => {
    // AirPods 5 : toutes les variantes actives sont à 98 000 FCFA.
    expect(card("ap5")?.replace(/\s/g, " ")).toBe("98 000 FCFA");
  });

  it("affiche « Dès » et le plus petit prix quand les variantes ont plusieurs prix", () => {
    expect(card("ip18")?.replace(/\s/g, " ")).toBe("Dès 970 000 FCFA");
  });

  it("garde « Acheter » pour les cartes qui n'ouvrent pas l'article entier", () => {
    const product = products.find((p) => p.code === "ap5")!;
    render(<ProductCard product={{ ...product, is_new: false }} />);
    expect(screen.getByRole("link", { name: `Acheter ${product.name}` })).toBeTruthy();
  });

  it("rend la carte du rail entièrement cliquable, sans CTA imbriqué", () => {
    const product = products.find((p) => p.code === "ap5")!;
    const { container } = render(<ProductCard product={{ ...product, is_new: false }} wholeCard />);
    expect(screen.getByRole("link", { name: new RegExp(product.name) })).toBeTruthy();
    expect(container.querySelector(".product-card-whole-link button")).toBeNull();
  });

  it("écrit « Voir le produit » en disposition adaptive (pages marque, pas de panier)", () => {
    const product = products.find((p) => p.code === "ip18")!;
    const { container } = render(
      <ProductCard product={{ ...product, is_new: false }} layout="adaptive" />,
    );
    const link = screen.getByRole("link", { name: `Voir le produit ${product.name}` });
    expect(link.textContent).toBe("Voir le produit");
    expect(container.textContent).not.toContain("Acheter");
  });

  it("affiche la catégorie et les coloris (au plus 4 pastilles, puis « +N »)", () => {
    const product = products.find((p) => p.code === "ip18")!;
    const swatches = colorSwatches(product.variants);
    const { container } = render(
      <ProductCard
        product={{ ...product, is_new: false }}
        layout="adaptive"
        category="Smartphones"
        swatches={swatches}
      />,
    );
    expect(container.querySelector("[data-card-category]")?.textContent).toBe("Smartphones");
    const dots = container.querySelectorAll(
      "[data-card-swatches] > span[aria-hidden]:not(.tabular-nums)",
    );
    expect(dots).toHaveLength(Math.min(swatches.length, 4));
    const names = container.querySelector("[data-card-swatches] .sr-only")?.textContent ?? "";
    for (const swatch of swatches) expect(names).toContain(swatch.name);
  });

  it("marque le produit phare (featured) en disposition adaptive seulement", () => {
    const product = products.find((p) => p.code === "ip18")!;
    const { container, rerender } = render(
      <ProductCard product={{ ...product, is_new: false }} layout="adaptive" featured />,
    );
    expect(container.querySelector("[data-featured]")).not.toBeNull();
    rerender(<ProductCard product={{ ...product, is_new: false }} featured />);
    expect(container.querySelector("[data-featured]")).toBeNull();
  });
});
