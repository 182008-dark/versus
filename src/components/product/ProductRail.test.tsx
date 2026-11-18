import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProductRail, type RailItem } from "./ProductRail";

const items: RailItem[] = [
  { key: "ip18", brand: "apple", card: <p>iPhone 18 Pro</p> },
  { key: "a57", brand: "samsung", card: <p>Galaxy A57</p> },
  { key: "gb4", brand: "samsung", card: <p>Galaxy Buds4</p> },
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
    render(<ProductRail id="rail" items={items} label="Nouveautés" filters={filters} />);
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
    render(<ProductRail id="rail" items={items} label="Nouveautés" filters={filters} />);
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
    render(<ProductRail id="rail" items={items} label="Nouveautés" filters={filters} />);
    await user.click(screen.getByRole("button", { name: "Produits suivants" }));
    expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({ behavior: "auto" }));
  });

  it("filtre sans JavaScript : un bouton radio par marque, avec son nombre de produits", () => {
    render(<ProductRail id="rail" items={items} label="Nouveautés" filters={filters} />);
    const group = screen.getByRole("group", { name: "Filtrer par marque" });
    expect(screen.getByRole("radio", { name: "Toutes, 3 produits" })).toHaveProperty(
      "checked",
      true,
    );
    expect(screen.getByRole("radio", { name: "Samsung, 2 produits" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Apple, 1 produit" })).toBeTruthy();
    expect(group.querySelectorAll("input[type=radio][name='rail-marque']")).toHaveLength(4);
    // Le CSS masque les cartes des autres marques : chacune porte la sienne.
    expect(screen.getAllByRole("listitem").map((item) => item.getAttribute("data-brand"))).toEqual([
      "apple",
      "samsung",
      "samsung",
    ]);
  });

  it("revient au début du rail quand le filtre change", async () => {
    const user = userEvent.setup();
    render(<ProductRail id="rail" items={items} label="Nouveautés" filters={filters} />);
    scrollTo(300);
    await user.click(screen.getByRole("radio", { name: /^Samsung/ }));
    expect(rail().scrollLeft).toBe(0);
    expect(
      screen.getByRole("button", { name: "Produits précédents" }).getAttribute("aria-disabled"),
    ).toBe("true");
  });

  it("prépare l'état vide d'une marque absente du rail", () => {
    render(<ProductRail id="rail" items={items} label="Nouveautés" filters={filters} />);
    expect(
      screen.getByText("Aucun produit Xiaomi pour le moment.").getAttribute("data-rail-empty"),
    ).toBe("xiaomi");
    expect(screen.queryByText("Aucun produit Apple pour le moment.")).toBeNull();
  });
});

describe("ProductRail : en-tête et ligne de filtres", () => {
  const links = {
    all: { href: "/boutique", label: "Tout le catalogue (30)" },
    apple: { href: "/marques/apple", label: "Voir les 10 produits Apple" },
    samsung: { href: "/marques/samsung", label: "Voir les 10 produits Samsung" },
    xiaomi: { href: "/marques/xiaomi", label: "Voir les 10 produits Xiaomi" },
  };

  it("affiche le titre reçu et un lien d'en-tête par filtre, que le CSS choisit", () => {
    render(
      <ProductRail
        id="rail"
        items={items}
        label="Nouveautés"
        filters={filters}
        heading={<h2>Nouveautés</h2>}
        links={links}
      />,
    );
    expect(screen.getByRole("heading", { name: "Nouveautés" })).toBeTruthy();
    const all = screen.getByRole("link", { name: "Tout le catalogue (30)" });
    expect(all.getAttribute("href")).toBe("/boutique");
    expect(all.closest("[data-rail-link]")?.getAttribute("data-rail-link")).toBe("all");
    const samsung = screen.getByRole("link", { name: "Voir les 10 produits Samsung" });
    expect(samsung.getAttribute("href")).toBe("/marques/samsung");
    expect(samsung.closest("[data-rail-link]")?.getAttribute("data-rail-link")).toBe("samsung");
  });

  it("garde les pastilles sur une seule ligne", () => {
    render(<ProductRail id="rail" items={items} label="Nouveautés" filters={filters} />);
    const group = screen.getByRole("group", { name: "Filtrer par marque" });
    expect(group.className).toContain("flex-nowrap");
    expect(group.className).not.toContain("flex-wrap ");
  });
});
