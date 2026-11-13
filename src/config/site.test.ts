import { describe, expect, it } from "vitest";
import {
  deliveredGroups,
  deliveredLinks,
  footerColumns,
  headerActions,
  legalLinks,
  mainNav,
  mobileNav,
  routeFor,
} from "./site";

describe("routeFor", () => {
  it("renvoie le chemin d'une route livrée", () => {
    expect(routeFor("accueil")).toBe("/");
    expect(routeFor("mentionsLegales")).toBe("/mentions-legales");
    expect(routeFor("credits")).toBe("/credits");
  });

  it("déclare livrées les pages d'information de l'étape 2", () => {
    expect(routeFor("confidentialite")).toBe("/confidentialite");
    expect(routeFor("cgv")).toBe("/cgv");
    expect(routeFor("livraison")).toBe("/livraison");
    expect(routeFor("garantie")).toBe("/garantie");
  });

  it("renvoie null pour une route prévue mais pas encore livrée", () => {
    expect(routeFor("boutique")).toBeNull();
    expect(routeFor("panier")).toBeNull();
    expect(routeFor("faq")).toBeNull();
  });
});

describe("deliveredLinks et deliveredGroups", () => {
  it("masquent les liens dont la page n'existe pas", () => {
    expect(
      deliveredLinks([
        { label: "Accueil", route: "accueil" },
        { label: "Panier", route: "panier" },
      ]),
    ).toEqual([{ label: "Accueil", href: "/" }]);
  });

  it("retirent un groupe devenu vide", () => {
    expect(
      deliveredGroups([
        { label: "Boutique", links: [{ label: "Panier", route: "panier" }] },
        { label: "Aide", links: [{ label: "Garantie", route: "garantie" }] },
      ]),
    ).toEqual([{ label: "Aide", links: [{ label: "Garantie", href: "/garantie" }] }]);
  });
});

describe("gabarit de l'étape 2", () => {
  it("masque toutes les icônes de l'en-tête (aucune route livrée)", () => {
    expect(headerActions).toEqual([]);
  });

  it("masque la navigation principale (boutique, marques et outils non livrés)", () => {
    expect(mainNav).toEqual([]);
  });

  it("le menu mobile ne propose que l'aide livrée", () => {
    expect(mobileNav).toEqual([
      {
        label: "Aide",
        links: [
          { label: "Livraison et retours", href: "/livraison" },
          { label: "Garantie", href: "/garantie" },
        ],
      },
    ]);
  });

  it("le pied de page ne contient que des routes livrées", () => {
    expect(footerColumns.map((c) => c.label)).toEqual(["Aide", "VERSUS"]);
    expect(footerColumns.flatMap((c) => c.links.map((l) => l.href))).toEqual([
      "/livraison",
      "/garantie",
      "/mentions-legales",
    ]);
    expect(legalLinks.map((l) => l.href)).toEqual(["/confidentialite", "/cgv", "/credits"]);
  });
});
