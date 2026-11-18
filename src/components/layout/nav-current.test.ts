import { describe, expect, it } from "vitest";
import { isCurrentLink } from "./nav-current";

describe("isCurrentLink", () => {
  it("marque la page courante seulement si l'adresse correspond exactement", () => {
    expect(isCurrentLink("/marques/samsung", "/marques/samsung")).toBe(true);
    expect(isCurrentLink("/boutique", "/boutique")).toBe(true);
    expect(isCurrentLink("/marques/samsung", "/marques/apple")).toBe(false);
    expect(isCurrentLink("/marques/samsung/", "/marques/samsung")).toBe(false);
    expect(isCurrentLink("/produit/galaxy-s26", "/marques/samsung")).toBe(false);
  });

  it("ne marque jamais une ancre, même sur sa page (/boutique#smartphones)", () => {
    expect(isCurrentLink("/boutique", "/boutique#smartphones")).toBe(false);
    expect(isCurrentLink("/", "/#comparer")).toBe(false);
    expect(isCurrentLink("/boutique", "#smartphones")).toBe(false);
  });

  it("ignore un chemin inconnu (rendu hors navigation)", () => {
    expect(isCurrentLink(null, "/boutique")).toBe(false);
  });

  it("peut être désactivé (lien en double d'une navigation prioritaire)", () => {
    expect(isCurrentLink("/marques/samsung", "/marques/samsung", false)).toBe(false);
  });
});
