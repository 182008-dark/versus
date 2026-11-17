import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";
import { NewBadge } from "./NewBadge";

describe("Badge", () => {
  it("« Nouveau » : vert foncé sur vert pâle, en casse normale", () => {
    render(<NewBadge />);
    const badge = screen.getByText("Nouveau");
    expect(badge.className).toContain("bg-accent-soft");
    expect(badge.className).toContain("text-badge-new-ink");
    expect(badge.className).not.toMatch(/uppercase|tracking/);
    expect(badge.className).toContain("rounded-full");
  });

  it("« Épuisé » est gris neutre, jamais vert", () => {
    render(<Badge tone="muted">Épuisé</Badge>);
    const badge = screen.getByText("Épuisé");
    expect(badge.className).toContain("text-muted-strong");
    expect(badge.className).not.toMatch(/accent/);
  });

  it("le ton brand lit les couleurs de [data-brand]", () => {
    render(<Badge tone="brand">Samsung</Badge>);
    expect(screen.getByText("Samsung").className).toContain("text-brand-ink");
  });

  it("l'ancien ton accent reste un alias de new", () => {
    const { container } = render(
      <>
        <Badge tone="accent">A</Badge>
        <Badge tone="new">B</Badge>
      </>,
    );
    const [a, b] = [...container.querySelectorAll("span")];
    expect(a?.className).toBe(b?.className);
  });
});
