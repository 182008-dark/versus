import { describe, expect, it } from "vitest";
import { computeSiteUrl, isStyleguideEnabled, parseEnv } from "./env";

describe("isStyleguideEnabled", () => {
  it("masque /styleguide en production Vercel", () => {
    const env = parseEnv({
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://versus.example",
    });
    expect(isStyleguideEnabled(env)).toBe(false);
  });

  it("l'affiche en preview et en développement Vercel", () => {
    expect(isStyleguideEnabled(parseEnv({ VERCEL_ENV: "preview" }))).toBe(true);
    expect(isStyleguideEnabled(parseEnv({ VERCEL_ENV: "development" }))).toBe(true);
  });

  it("l'affiche en local et sous next start (sans VERCEL_ENV), quel que soit NODE_ENV", () => {
    // next start et next build fixent NODE_ENV=production : ce n'est pas la production.
    expect(isStyleguideEnabled(parseEnv({ NODE_ENV: "production" }))).toBe(true);
    expect(isStyleguideEnabled(parseEnv({}))).toBe(true);
  });
});

describe("parseEnv", () => {
  it("accepte un environnement vide (local) avec les valeurs par défaut", () => {
    const env = parseEnv({});
    expect(env.ALLOW_INDEXING).toBe("false");
    expect(env.NEXT_PUBLIC_SITE_URL).toBeUndefined();
  });

  it("traite une variable vide comme absente", () => {
    const env = parseEnv({ NEXT_PUBLIC_SITE_URL: "", ALLOW_INDEXING: "" });
    expect(env.NEXT_PUBLIC_SITE_URL).toBeUndefined();
    expect(env.ALLOW_INDEXING).toBe("false");
  });

  it("exige NEXT_PUBLIC_SITE_URL en production", () => {
    expect(() => parseEnv({ VERCEL_ENV: "production" })).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it("n'exige pas NEXT_PUBLIC_SITE_URL en preview", () => {
    expect(() =>
      parseEnv({ VERCEL_ENV: "preview", VERCEL_BRANCH_URL: "versus-git-x.vercel.app" }),
    ).not.toThrow();
  });

  it("refuse une URL invalide et une valeur ALLOW_INDEXING inconnue", () => {
    expect(() => parseEnv({ NEXT_PUBLIC_SITE_URL: "pas-une-url" })).toThrow();
    expect(() => parseEnv({ ALLOW_INDEXING: "oui" })).toThrow();
  });
});

describe("computeSiteUrl", () => {
  it("prend NEXT_PUBLIC_SITE_URL sans barre oblique finale", () => {
    expect(computeSiteUrl(parseEnv({ NEXT_PUBLIC_SITE_URL: "https://versus.example/" }))).toBe(
      "https://versus.example",
    );
  });

  it("calcule l'URL d'une preview depuis VERCEL_BRANCH_URL", () => {
    expect(
      computeSiteUrl(
        parseEnv({ VERCEL_ENV: "preview", VERCEL_BRANCH_URL: "versus-git-x.vercel.app" }),
      ),
    ).toBe("https://versus-git-x.vercel.app");
  });

  it("revient à localhost par défaut", () => {
    expect(computeSiteUrl(parseEnv({}))).toBe("http://localhost:3000");
  });
});
