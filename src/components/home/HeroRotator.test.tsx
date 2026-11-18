import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HeroRotator, type HeroRotatorSlide } from "./HeroRotator";

const icons = { previous: "‹", next: "›" };
const slides: HeroRotatorSlide[] = ["ip18", "s26u", "x17u"].map((key) => ({
  key,
  name: `Produit ${key}`,
  tone: "dark",
  style: { "--hero-ink": "white" },
  content: (
    <>
      <h2>{key}</h2>
      <a href={`/produit/${key}`}>Voir {key}</a>
    </>
  ),
}));

function carousel() {
  return document.querySelector<HTMLElement>(".hero-carousel")!;
}

function activeSlide() {
  return document.querySelector(".hero-slide-active")?.getAttribute("data-product-slide");
}

function groups() {
  return Array.from(document.querySelectorAll<HTMLElement>("[aria-roledescription='diapositive']"));
}

describe("HeroRotator", () => {
  it("expose chaque diapositive comme un groupe « n sur N » dans un carrousel nommé", () => {
    render(<HeroRotator slides={slides} icons={icons} />);
    expect(groups().map((group) => group.getAttribute("aria-label"))).toEqual([
      "1 sur 3",
      "2 sur 3",
      "3 sur 3",
    ]);
    for (const group of groups()) expect(group.getAttribute("role")).toBe("group");
    expect(carousel().getAttribute("aria-roledescription")).toBe("carrousel");
    expect(carousel().getAttribute("aria-label")).toBe("Produits à la une");
  });

  it("masque les diapositives inactives aux lecteurs d'écran et au clavier (aria-hidden, inert)", () => {
    // jsdom n'implémente pas la propriété `inert` : on lit l'attribut.
    render(<HeroRotator slides={slides} icons={icons} />);
    const [first, second, third] = groups();
    expect(first!.hasAttribute("aria-hidden")).toBe(false);
    expect(first!.hasAttribute("inert")).toBe(false);
    for (const hidden of [second!, third!]) {
      expect(hidden.getAttribute("aria-hidden")).toBe("true");
      expect(hidden.hasAttribute("inert")).toBe(true);
    }
    // Seul le lien de la diapositive affichée est exposé.
    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual(["Voir ip18"]);
  });

  it("ne tourne jamais seul et annonce poliment les changements manuels", () => {
    render(<HeroRotator slides={slides} icons={icons} />);
    expect(carousel().hasAttribute("data-manual")).toBe(true);
    expect(carousel().hasAttribute("data-autoplay")).toBe(false);
    expect(document.querySelector(".hero-slides")?.getAttribute("aria-live")).toBe("polite");
    expect(screen.queryByRole("button", { name: /défilement/ })).toBeNull();
    expect(activeSlide()).toBe("ip18");
  });

  it("avance, recule et boucle de la dernière à la première diapositive", async () => {
    const user = userEvent.setup();
    render(<HeroRotator slides={slides} icons={icons} />);
    const next = screen.getByRole("button", { name: "Diapositive suivante" });
    await user.click(next);
    expect(activeSlide()).toBe("s26u");
    expect(groups()[1]!.hasAttribute("inert")).toBe(false);
    expect(groups()[0]!.hasAttribute("inert")).toBe(true);
    await user.click(next);
    expect(activeSlide()).toBe("x17u");
    await user.click(next);
    expect(activeSlide()).toBe("ip18");
    await user.click(screen.getByRole("button", { name: "Diapositive précédente" }));
    expect(activeSlide()).toBe("x17u");
  });

  it("choisit une diapositive avec son point et ne rejoue l'entrée animée qu'après un changement", async () => {
    const user = userEvent.setup();
    render(<HeroRotator slides={slides} icons={icons} />);
    expect(carousel().hasAttribute("data-changed")).toBe(false);
    await user.click(screen.getByRole("button", { name: "Afficher Produit s26u" }));
    expect(activeSlide()).toBe("s26u");
    expect(carousel().hasAttribute("data-changed")).toBe(true);
  });

  it("pose le thème de la diapositive active sur le carrousel (commandes comprises)", () => {
    render(<HeroRotator slides={slides} icons={icons} />);
    expect(carousel().getAttribute("data-tone")).toBe("dark");
    expect(carousel().style.getPropertyValue("--hero-ink")).toBe("white");
  });

  it("diffère l'affichage des diapositives cachées jusqu'au chargement de la page", () => {
    render(<HeroRotator slides={slides} icons={icons} />);
    // jsdom : `document.readyState` vaut « complete » après le rendu ; l'attribut a disparu.
    act(() => window.dispatchEvent(new Event("load")));
    expect(carousel().hasAttribute("data-deferred")).toBe(document.readyState !== "complete");
  });
});
