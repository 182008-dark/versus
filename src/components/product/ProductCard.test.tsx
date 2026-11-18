import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { products } from "@/data/catalog";
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
});
