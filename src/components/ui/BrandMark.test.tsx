import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BRANDS } from "@/lib/brand-themes";
import { BrandMark } from "./BrandMark";

describe("BrandMark", () => {
  it.each(BRANDS)("affiche la pastille et le nom en casse normale (%s)", (brand) => {
    const { container } = render(<BrandMark brand={brand} />);
    const mark = container.firstElementChild as HTMLElement;
    expect(mark.getAttribute("data-brand")).toBe(brand);
    expect(mark.textContent).toMatch(/^(Apple|Samsung|Xiaomi)$/);
    expect(mark.className).toContain("text-brand-ink");
    expect(mark.className).not.toMatch(/uppercase|tracking/);
  });

  it("la pastille est décorative et à la couleur de la marque", () => {
    const { container } = render(<BrandMark brand="xiaomi" />);
    const dot = container.querySelector("[data-brand-dot]");
    expect(dot?.getAttribute("aria-hidden")).toBe("true");
    expect(dot?.className).toContain("bg-brand-mark");
    expect(dot?.className).toContain("rounded-full");
    expect(dot?.className).toContain("size-2");
  });

  it("devient un lien nommé par la marque avec href (cible de 44 px)", () => {
    render(<BrandMark brand="samsung" href="/boutique" />);
    const link = screen.getByRole("link", { name: "Samsung" });
    expect(link.getAttribute("href")).toBe("/boutique");
    expect(link.className).toContain("min-h-11");
  });

  it("reste un simple texte sans href", () => {
    render(<BrandMark brand="apple" />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("Apple")).toBeTruthy();
  });

  it("passe en blanc sur fond sombre", () => {
    const { container } = render(<BrandMark brand="apple" tone="onDark" />);
    expect((container.firstElementChild as HTMLElement).className).toContain("text-on-dark");
  });
});

describe("BrandMark sur un fond coloré", () => {
  it("prend la couleur du texte voisin avec tone=inherit (hero)", () => {
    const { container } = render(<BrandMark brand="xiaomi" tone="inherit" />);
    const mark = container.firstElementChild as HTMLElement;
    expect(mark.className).toContain("text-current");
    expect(mark.className).not.toContain("text-brand-ink");
    expect(container.querySelector("[data-brand-dot]")?.className).toContain("bg-current");
  });
});
