import { describe, expect, it } from "vitest";
import {
  deliveredGroups,
  deliveredLinks,
  footerColumns,
  headerActions,
  legalLinks,
  mainNav,
  mobileNav,
  productHref,
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
    expect(routeFor("panier")).toBeNull();
    expect(routeFor("faq")).toBeNull();
  });

  it("livre la boutique, les fiches et compose une URL de fiche valide", () => {
    expect(routeFor("boutique")).toBe("/boutique");
    expect(routeFor("produit")).toBe("/produit");
    expect(routeFor("smartphones")).toBe("/boutique#smartphones");
    expect(routeFor("bracelets")).toBe("/boutique#bracelets");
    expect(productHref("iphone-18-pro")).toBe("/produit/iphone-18-pro");
    expect(productHref("un slug/encodé")).toBe("/produit/un%20slug%2Fencod%C3%A9");
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

describe("gabarit de l'étape 3", () => {
  it("masque toutes les icônes de l'en-tête (aucune route livrée)", () => {
    expect(headerActions).toEqual([]);
  });

  it("redirige les marques et catégories livrées vers la boutique", () => {
    expect(mainNav).toEqual([
      {
        label: "Marques",
        links: [
          { label: "Apple", href: "/boutique" },
          { label: "Samsung", href: "/boutique" },
          { label: "Xiaomi", href: "/boutique" },
        ],
      },
      {
        label: "Catégories",
        links: [
          { label: "Smartphones", href: "/boutique#smartphones" },
          { label: "Écouteurs", href: "/boutique#ecouteurs" },
          { label: "Montres", href: "/boutique#montres" },
          { label: "Bracelets", href: "/boutique#bracelets" },
        ],
      },
    ]);
  });

  it("le menu mobile propose la boutique et l'aide livrée", () => {
    expect(mobileNav).toEqual([
      ...mainNav,
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
    expect(footerColumns.map((c) => c.label)).toEqual(["Boutique", "Aide", "VERSUS"]);
    expect(footerColumns.flatMap((c) => c.links.map((l) => l.href))).toEqual([
      "/boutique",
      "/boutique",
      "/boutique",
      "/boutique",
      "/livraison",
      "/garantie",
      "/mentions-legales",
    ]);
    expect(legalLinks.map((l) => l.href)).toEqual(["/confidentialite", "/cgv", "/credits"]);
  });
});
