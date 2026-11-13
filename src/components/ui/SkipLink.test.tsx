import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SkipLink } from "@/components/ui/SkipLink";

describe("SkipLink", () => {
  it("mène au contenu principal (#contenu) par défaut", () => {
    render(<SkipLink />);
    expect(screen.getByRole("link", { name: "Aller au contenu" }).getAttribute("href")).toBe(
      "#contenu",
    );
  });

  it("accepte une autre cible", () => {
    render(<SkipLink targetId="resultats" />);
    expect(
      screen.getAllByRole("link", { name: "Aller au contenu" }).at(-1)?.getAttribute("href"),
    ).toBe("#resultats");
  });
});
