import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HeroRotator, type HeroRotatorSlide } from "./HeroRotator";

const icons = { previous: "‹", next: "›", play: "▶", pause: "❚❚" };
const slides: HeroRotatorSlide[] = ["ip18", "gw9", "rn15"].map((key) => ({
  key,
  name: `Produit ${key}`,
  tone: "dark",
  style: { "--hero-ink": "white" },
  content: <h2>{key}</h2>,
}));

/** jsdom n'a pas matchMedia : `reduce` simule la préférence « mouvement réduit ». */
function mockMotion(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches: query.includes("no-preference") ? !reduce : reduce,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

function carousel() {
  return document.querySelector<HTMLElement>(".hero-carousel")!;
}

function activeSlide() {
  return document.querySelector(".hero-slide-active")?.getAttribute("data-product-slide");
}

function endProgress() {
  const fill = document.querySelector(".hero-dot-active .hero-dot-fill")!;
  fireEvent.animationEnd(fill, { animationName: "fill" });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("HeroRotator", () => {
  it("expose chaque diapositive comme un groupe « n sur N » et masque les autres", () => {
    mockMotion(false);
    render(<HeroRotator slides={slides} icons={icons} />);
    const groups = document.querySelectorAll("[aria-roledescription='diapositive']");
    expect(Array.from(groups, (group) => group.getAttribute("aria-label"))).toEqual([
      "1 sur 3",
      "2 sur 3",
      "3 sur 3",
    ]);
    expect(groups[0]!.getAttribute("role")).toBe("group");
    expect(groups[1]!.getAttribute("aria-hidden")).toBe("true");
    expect(carousel().getAttribute("aria-roledescription")).toBe("carrousel");
  });

  it("avance à la fin de la barre, la zone n'étant pas annoncée pendant la rotation", () => {
    mockMotion(false);
    render(<HeroRotator slides={slides} icons={icons} />);
    expect(carousel().hasAttribute("data-autoplay")).toBe(true);
    expect(document.querySelector(".hero-slides")!.getAttribute("aria-live")).toBe("off");
    act(endProgress);
    expect(activeSlide()).toBe("gw9");
    act(endProgress);
    act(endProgress);
    expect(activeSlide()).toBe("ip18");
  });

  it("se met en pause au survol de la souris (pas au toucher) et au focus", () => {
    mockMotion(false);
    render(<HeroRotator slides={slides} icons={icons} />);
    fireEvent.pointerEnter(carousel(), { pointerType: "touch" });
    expect(carousel().hasAttribute("data-paused")).toBe(false);
    fireEvent.pointerEnter(carousel(), { pointerType: "mouse" });
    expect(carousel().hasAttribute("data-paused")).toBe(true);
    fireEvent.pointerLeave(carousel(), { pointerType: "mouse" });
    expect(carousel().hasAttribute("data-paused")).toBe(false);

    act(() => screen.getByRole("button", { name: "Diapositive suivante" }).focus());
    expect(carousel().hasAttribute("data-paused")).toBe(true);
    expect(document.querySelector(".hero-slides")!.getAttribute("aria-live")).toBe("polite");
  });

  it("le bouton de rotation arrête durablement le défilement, puis le relance", async () => {
    mockMotion(false);
    const user = userEvent.setup();
    render(<HeroRotator slides={slides} icons={icons} />);
    await user.click(screen.getByRole("button", { name: "Mettre en pause le défilement" }));
    expect(carousel().hasAttribute("data-stopped")).toBe(true);
    // Sortir du carrousel ne relance pas la rotation.
    act(() => (document.activeElement as HTMLElement).blur());
    fireEvent.pointerLeave(carousel(), { pointerType: "mouse" });
    expect(carousel().hasAttribute("data-paused")).toBe(true);
    await user.click(screen.getByRole("button", { name: "Lancer le défilement" }));
    expect(carousel().hasAttribute("data-stopped")).toBe(false);
  });

  it("ne tourne pas sous mouvement réduit et n'offre alors aucun bouton de rotation", () => {
    mockMotion(true);
    render(<HeroRotator slides={slides} icons={icons} />);
    expect(carousel().hasAttribute("data-autoplay")).toBe(false);
    expect(carousel().hasAttribute("data-paused")).toBe(true);
    expect(screen.queryByRole("button", { name: /défilement/ })).toBeNull();
  });
});
