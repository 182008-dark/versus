import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";
import {
  BUTTON_VARIANTS,
  LEGACY_BUTTON_VARIANTS,
  buttonClasses,
  resolveButtonVariant,
} from "./button-styles";

describe("Button", () => {
  it("rend un <button type=button> par défaut (aucune soumission accidentelle)", () => {
    render(<Button>Acheter</Button>);
    expect(screen.getByRole("button", { name: "Acheter" }).getAttribute("type")).toBe("button");
  });

  it("garde type=submit quand on le demande", () => {
    render(<Button type="submit">Valider</Button>);
    expect(screen.getByRole("button", { name: "Valider" }).getAttribute("type")).toBe("submit");
  });

  it("rend un lien quand href est fourni", () => {
    render(<Button href="/livraison">Livraison</Button>);
    const link = screen.getByRole("link", { name: "Livraison" });
    expect(link.getAttribute("href")).toBe("/livraison");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("expose l'état d'un bouton bascule par aria-pressed", () => {
    render(
      <>
        <Button pressed>Ajouté</Button>
        <Button pressed={false}>Comparer</Button>
        <Button>Simple</Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "Ajouté" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(screen.getByRole("button", { name: "Comparer" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
    expect(screen.getByRole("button", { name: "Simple" }).hasAttribute("aria-pressed")).toBe(false);
  });
});

describe("buttonClasses", () => {
  it("respecte la cible tactile : 44 px (md) et 48 px (lg)", () => {
    expect(buttonClasses({ size: "md" })).toContain("h-11");
    expect(buttonClasses({ size: "lg" })).toContain("h-12");
  });

  it("trois variantes seulement : primary, secondary, onDark", () => {
    expect([...BUTTON_VARIANTS]).toEqual(["primary", "secondary", "onDark"]);
  });

  it("aucun agrandissement au survol ; enfoncement à l'appui, seulement sans mouvement réduit", () => {
    for (const variant of BUTTON_VARIANTS) {
      const classes = buttonClasses({ variant }).split(/\s+/);
      expect(classes.some((c) => /scale-1\d\d/.test(c))).toBe(false);
      expect(classes.filter((c) => c.includes("scale-"))).toEqual([
        "motion-safe:state-active:scale-97",
      ]);
    }
  });

  it("les anciens noms sont des alias temporaires (dark, light et brand donnent du vert)", () => {
    for (const [legacy, target] of Object.entries(LEGACY_BUTTON_VARIANTS)) {
      expect(resolveButtonVariant(legacy as keyof typeof LEGACY_BUTTON_VARIANTS)).toBe(target);
      expect(buttonClasses({ variant: legacy as keyof typeof LEGACY_BUTTON_VARIANTS })).toBe(
        buttonClasses({ variant: target }),
      );
    }
    expect(buttonClasses({ variant: "brand" })).not.toMatch(/brand/);
  });

  it("le contour du bouton secondaire est le rôle des contrôles (≥ 3:1)", () => {
    expect(buttonClasses({ variant: "secondary" })).toContain("border-line-control");
  });

  it("le bouton principal utilise l'accent VERSUS", () => {
    expect(buttonClasses({ variant: "primary" })).toContain("bg-accent");
    expect(buttonClasses({ variant: "primary" })).toContain("state-hover:bg-accent-hover");
  });
});
