import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProductRail, type RailItem } from "./ProductRail";

const items: RailItem[] = [
  { key: "ip18", brand: "apple", card: <p>iPhone 18 Pro</p> },
  { key: "a57", brand: "samsung", card: <p>Galaxy A57</p> },
  { key: "gb4", brand: "samsung", card: <p>Galaxy Buds 4</p> },
];
const filters = [
  { value: "all", label: "Toutes" },
  { value: "apple", label: "Apple" },
  { value: "samsung", label: "Samsung" },
  { value: "xiaomi", label: "Xiaomi" },
];

/** Géométrie simulée du rail (jsdom ne calcule aucune mise en page). */
const geometry = { scrollWidth: 900, clientWidth: 300 };
const scrollBy = vi.fn();

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("matchMedia", () => ({ matches: true }) as unknown as MediaQueryList);
  for (const [key, value] of Object.entries(geometry)) {
    Object.defineProperty(HTMLElement.prototype, key, { configurable: true, get: () => value });
  }
  HTMLElement.prototype.scrollBy = scrollBy as unknown as HTMLElement["scrollBy"];
  scrollBy.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function rail() {
  return screen.getByRole("list", { name: "Nouveautés" });
}

function scrollTo(left: number) {
  act(() => {
    rail().scrollLeft = left;
    rail().dispatchEvent(new Event("scroll"));
  });
}

describe("ProductRail", () => {
  it("désactive « précédents » au début sans retirer le bouton du parcours clavier", async () => {
    const user = userEvent.setup();
    render(<ProductRail items={items} label="Nouveautés" filters={filters} />);
    const previous = screen.getByRole("button", { name: "Produits précédents" });
    const next = screen.getByRole("button", { name: "Produits suivants" });
    expect(previous.getAttribute("aria-disabled")).toBe("true");
    expect(previous.hasAttribute("disabled")).toBe(false);
    expect(next.hasAttribute("aria-disabled")).toBe(false);
    await user.click(previous);
    expect(scrollBy).not.toHaveBeenCalled();
    await user.click(next);
    expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({ behavior: "smooth" }));
  });

  it("garde le focus sur « suivants » quand il devient inactif en fin de rail", async () => {
    const user = userEvent.setup();
    render(<ProductRail items={items} label="Nouveautés" filters={filters} />);
    const next = screen.getByRole("button", { name: "Produits suivants" });
    next.focus();
    await user.keyboard("{Enter}");
    scrollTo(600);
    expect(next.getAttribute("aria-disabled")).toBe("true");
    expect(document.activeElement).toBe(next);
    expect(
      screen.getByRole("button", { name: "Produits précédents" }).hasAttribute("aria-disabled"),
    ).toBe(false);
    scrollBy.mockClear();
    await user.keyboard("{Enter}");
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it("défile sans animation sous mouvement réduit", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }) as unknown as MediaQueryList);
    const user = userEvent.setup();
    render(<ProductRail items={items} label="Nouveautés" filters={filters} />);
    await user.click(screen.getByRole("button", { name: "Produits suivants" }));
    expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({ behavior: "auto" }));
  });

  it("filtre par marque, revient au début et annonce le nombre de produits", async () => {
    const user = userEvent.setup();
    render(<ProductRail items={items} label="Nouveautés" filters={filters} />);
    scrollTo(300);
    await user.click(screen.getByRole("button", { name: "Samsung" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(rail().scrollLeft).toBe(0);
    expect(screen.getByRole("status").textContent).toBe("2 produits Samsung affichés.");
    await user.click(screen.getByRole("button", { name: "Apple" }));
    expect(screen.getByRole("status").textContent).toBe("1 produit Apple affiché.");
  });

  it("change le message de statut à chaque filtre, même à nombre égal, et annonce « Toutes »", async () => {
    const user = userEvent.setup();
    const balanced: RailItem[] = [
      ...items,
      { key: "aw12", brand: "apple", card: <p>Apple Watch 12</p> },
    ];
    render(<ProductRail items={balanced} label="Nouveautés" filters={filters} />);
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("");
    await user.click(screen.getByRole("button", { name: "Apple" }));
    expect(status.textContent).toBe("2 produits Apple affichés.");
    await user.click(screen.getByRole("button", { name: "Samsung" }));
    expect(status.textContent).toBe("2 produits Samsung affichés.");
    await user.click(screen.getByRole("button", { name: "Toutes" }));
    expect(status.textContent).toBe("Tous les produits affichés : 4.");
  });

  it("affiche un état vide quand aucune carte ne correspond", async () => {
    const user = userEvent.setup();
    render(<ProductRail items={items} label="Nouveautés" filters={filters} />);
    await user.click(screen.getByRole("button", { name: "Xiaomi" }));
    expect(screen.queryByRole("list", { name: "Nouveautés" })).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("Aucun produit Xiaomi pour le moment.");
  });
});
