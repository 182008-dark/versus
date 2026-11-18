import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { Price, priceRange } from "./Price";

function priceText(ui: ReactElement) {
  const { container } = render(ui);
  const element = container.querySelector("[data-price]");
  if (!element) throw new Error("Prix absent");
  return { element, text: element.textContent };
}

describe("Price", () => {
  it("formate « Dès 970 000 FCFA » avec des espaces insécables", () => {
    const { text } = priceText(<Price amount={970000} from size="card" />);
    expect(text).toBe("Dès 970 000 FCFA");
    expect(text).not.toMatch(/ /); // aucune espace sécable : jamais coupé en deux lignes
  });

  it("n'affiche pas « Dès » pour un prix unique", () => {
    expect(priceText(<Price amount={98000} />).text).toBe("98 000 FCFA");
    expect(priceText(<Price amount={[98000, 98000]} />).text).toBe("98 000 FCFA");
  });

  it("affiche le plus petit prix et « Dès » quand les variantes diffèrent", () => {
    expect(priceText(<Price amount={[1129000, 970000, 1289000]} />).text).toBe("Dès 970 000 FCFA");
  });

  it("`from={false}` retire « Dès » même avec plusieurs prix", () => {
    expect(priceText(<Price amount={[1, 2]} from={false} />).text).toBe("1 FCFA");
  });

  it("aligne les chiffres et interdit le retour à la ligne", () => {
    const { element } = priceText(<Price amount={849000} size="lead" />);
    expect(element.className).toContain("tabular-nums");
    expect(element.className).toContain("whitespace-nowrap");
  });

  it("donne au montant la taille de sa variante et à « Dès » / « FCFA » 0,7 fois", () => {
    const card = priceText(<Price amount={970000} from size="card" />).element;
    expect(card.className).toContain("--text-price-card");
    expect(card.className).toContain("text-price");
    const affixes = [...card.querySelectorAll("span")].filter((s) =>
      /Dès|FCFA/.test(s.textContent),
    );
    expect(affixes).toHaveLength(2);
    for (const affix of affixes) expect(affix.className).toContain("text-[0.7em]");
    const lead = priceText(<Price amount={970000} size="lead" />).element;
    expect(lead.className).toContain("--text-price-lead");
  });

  it("refuse une liste vide", () => {
    expect(() => priceRange([])).toThrow(RangeError);
  });
});
