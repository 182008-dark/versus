import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { buttonClasses } from "@/components/ui/button-styles";
import { ErrorActions } from "./ErrorActions";

describe("ErrorActions", () => {
  it("garde exactement les classes du bouton du design system (écrites en toutes lettres)", () => {
    render(<ErrorActions retry={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Réessayer" }).className).toBe(
      buttonClasses({ variant: "primary", size: "lg" }),
    );
    expect(screen.getByRole("link", { name: "Retour à l'accueil" }).className).toBe(
      buttonClasses({ variant: "secondary", size: "lg" }),
    );
  });

  it("relance le rendu avec « Réessayer »", () => {
    const retry = vi.fn();
    render(<ErrorActions retry={retry} />);
    screen.getByRole("button", { name: "Réessayer" }).click();
    expect(retry).toHaveBeenCalledOnce();
  });
});
