import { describe, expect, it } from "vitest";
import { deliveredLinks, infoLinks, routeFor } from "./site";

describe("routeFor", () => {
  it("renvoie le chemin d'une route livrée", () => {
    expect(routeFor("accueil")).toBe("/");
    expect(routeFor("mentionsLegales")).toBe("/mentions-legales");
    expect(routeFor("credits")).toBe("/credits");
  });

  it("renvoie null pour une route prévue mais pas encore livrée", () => {
    expect(routeFor("boutique")).toBeNull();
    expect(routeFor("panier")).toBeNull();
  });
});

describe("deliveredLinks", () => {
  it("masque les liens dont la page n'existe pas", () => {
    expect(
      deliveredLinks([
        { label: "Accueil", route: "accueil" },
        { label: "Panier", route: "panier" },
      ]),
    ).toEqual([{ label: "Accueil", href: "/" }]);
  });

  it("le pied de page provisoire ne contient que des routes livrées", () => {
    expect(infoLinks.map((link) => link.href)).toEqual(["/mentions-legales", "/credits"]);
  });
});
