import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CarouselControls } from "./CarouselControls";

const icons = { previous: "‹", next: "›", play: "▶", pause: "❚❚" };
const names = ["iPhone 18 Pro", "Galaxy Watch 9", "Redmi Note 15 Pro+ 5G"];

function setup(overrides: Partial<Parameters<typeof CarouselControls>[0]> = {}) {
  const props = {
    names,
    active: 1,
    rotating: true,
    canRotate: true,
    icons,
    onSelect: vi.fn(),
    onToggleRotation: vi.fn(),
    onProgressEnd: vi.fn(),
    ...overrides,
  };
  render(<CarouselControls {...props} />);
  return props;
}

/** Fin d'animation CSS (AnimationEvent : voir vitest.polyfills.ts). */
function animationEnd(element: Element, animationName: string) {
  fireEvent.animationEnd(element, { animationName });
}

describe("CarouselControls", () => {
  it("nomme chaque commande sans glyphe et marque la diapositive affichée", () => {
    setup();
    expect(screen.getByRole("button", { name: "Diapositive précédente" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Diapositive suivante" })).toBeTruthy();
    const current = screen.getByRole("button", { name: "Afficher Galaxy Watch 9" });
    expect(current.getAttribute("aria-current")).toBe("true");
    expect(
      screen.getByRole("button", { name: "Afficher iPhone 18 Pro" }).hasAttribute("aria-current"),
    ).toBe(false);
  });

  it("change de diapositive avec les flèches, les points et les flèches du clavier", async () => {
    const user = userEvent.setup();
    const props = setup();
    await user.click(screen.getByRole("button", { name: "Diapositive suivante" }));
    expect(props.onSelect).toHaveBeenLastCalledWith(2);
    await user.click(screen.getByRole("button", { name: "Diapositive précédente" }));
    expect(props.onSelect).toHaveBeenLastCalledWith(0);
    await user.click(screen.getByRole("button", { name: "Afficher Redmi Note 15 Pro+ 5G" }));
    expect(props.onSelect).toHaveBeenLastCalledWith(2);

    screen.getByRole("button", { name: "Afficher Galaxy Watch 9" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(props.onSelect).toHaveBeenLastCalledWith(2);
    await user.keyboard("{ArrowLeft}");
    expect(props.onSelect).toHaveBeenLastCalledWith(0);
  });

  it("avance à la fin de l'animation « fill » de la barre active seulement", () => {
    const props = setup();
    const fills = document.querySelectorAll(".hero-dot-fill");
    animationEnd(fills[0]!, "fill");
    animationEnd(fills[1]!, "autre");
    expect(props.onProgressEnd).not.toHaveBeenCalled();
    animationEnd(fills[1]!, "fill");
    expect(props.onProgressEnd).toHaveBeenCalledTimes(1);
  });

  it("propose d'arrêter puis de relancer le défilement (WCAG 2.2.2)", async () => {
    const user = userEvent.setup();
    const props = setup();
    await user.click(screen.getByRole("button", { name: "Mettre en pause le défilement" }));
    expect(props.onToggleRotation).toHaveBeenCalledTimes(1);
  });

  it("affiche « Lancer le défilement » une fois le défilement arrêté", () => {
    setup({ rotating: false });
    expect(screen.getByRole("button", { name: "Lancer le défilement" })).toBeTruthy();
  });

  it("n'affiche pas le bouton de rotation quand la rotation est impossible", () => {
    setup({ canRotate: false });
    expect(screen.queryByRole("button", { name: /défilement/ })).toBeNull();
  });
});
