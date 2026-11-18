import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CarouselControls } from "./CarouselControls";

const icons = { previous: "‹", next: "›" };
const names = ["iPhone 18 Pro", "Galaxy S26 Ultra", "Xiaomi 17 Ultra"];

function setup(active = 1) {
  const onSelect = vi.fn();
  render(<CarouselControls names={names} active={active} icons={icons} onSelect={onSelect} />);
  return onSelect;
}

describe("CarouselControls", () => {
  it("nomme chaque commande sans glyphe et marque seulement la diapositive affichée", () => {
    setup();
    expect(screen.getByRole("group", { name: "Commandes du carrousel" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Diapositive précédente" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Diapositive suivante" })).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Afficher Galaxy S26 Ultra" })
        .getAttribute("aria-current"),
    ).toBe("true");
    for (const name of ["Afficher iPhone 18 Pro", "Afficher Xiaomi 17 Ultra"]) {
      expect(screen.getByRole("button", { name }).hasAttribute("aria-current")).toBe(false);
    }
  });

  it("n'a ni bouton de lecture ni barre de progression (aucun défilement automatique)", () => {
    setup();
    expect(screen.queryByRole("button", { name: /défilement|lecture|pause/i })).toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("ne remplit que le point actif (● ○ ○)", () => {
    setup(0);
    const dots = document.querySelectorAll(".hero-dot");
    expect(dots[0]!.classList.contains("hero-dot-active")).toBe(true);
    expect(document.querySelectorAll(".hero-dot-active")).toHaveLength(1);
  });

  it("change de diapositive avec les flèches, les points et les flèches du clavier", async () => {
    const user = userEvent.setup();
    const onSelect = setup();
    await user.click(screen.getByRole("button", { name: "Diapositive suivante" }));
    expect(onSelect).toHaveBeenLastCalledWith(2);
    await user.click(screen.getByRole("button", { name: "Diapositive précédente" }));
    expect(onSelect).toHaveBeenLastCalledWith(0);
    await user.click(screen.getByRole("button", { name: "Afficher Xiaomi 17 Ultra" }));
    expect(onSelect).toHaveBeenLastCalledWith(2);

    screen.getByRole("button", { name: "Afficher Galaxy S26 Ultra" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(onSelect).toHaveBeenLastCalledWith(2);
    await user.keyboard("{ArrowLeft}");
    expect(onSelect).toHaveBeenLastCalledWith(0);
  });

  it("ignore les autres touches", async () => {
    const user = userEvent.setup();
    const onSelect = setup();
    screen.getByRole("button", { name: "Afficher Galaxy S26 Ultra" }).focus();
    await user.keyboard("{ArrowUp}");
    expect(onSelect).not.toHaveBeenCalled();
  });
});
