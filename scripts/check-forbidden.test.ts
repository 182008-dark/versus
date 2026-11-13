// @vitest-environment node
import { describe, expect, it } from "vitest";
import { findViolations, isHexAllowed, scanRepository } from "./check-forbidden.mjs";

const rules = (path: string, content: string) => findViolations(path, content).map((v) => v.rule);

describe("liste blanche des hexadécimaux", () => {
  const allowed = [
    "src/data/catalog.ts",
    "src/lib/brand-themes.ts",
    "src/app/globals.css",
    "src/app/icon.svg",
    "src/app/opengraph-image.tsx",
    "src/app/(site)/produit/[slug]/opengraph-image.tsx",
  ];

  it.each(allowed)("accepte un hexadécimal dans %s", (path) => {
    expect(isHexAllowed(path)).toBe(true);
    expect(findViolations(path, 'const color = "#5A1F2B";')).toEqual([]);
  });

  it("refuse un hexadécimal dans un composant", () => {
    expect(
      rules("src/components/home/HeroSlide.tsx", '<div style={{ color: "#1D1D1F" }} />'),
    ).toEqual(["hex-hors-liste-blanche"]);
    expect(rules("src/app/layout.tsx", "themeColor: '#fff',")).toEqual(["hex-hors-liste-blanche"]);
  });

  it("accepte les chemins Windows", () => {
    expect(isHexAllowed("src\\data\\catalog.ts")).toBe(true);
  });

  it("ne confond pas une ancre ou une entité HTML avec une couleur", () => {
    expect(findViolations("src/app/page.tsx", '<a href="#contenu">Aller au contenu</a>')).toEqual(
      [],
    );
    expect(findViolations("src/app/page.tsx", "<p>&#123;</p>")).toEqual([]);
  });
});

describe("bleus Apple interdits", () => {
  it.each([
    "src/app/globals.css",
    "src/data/catalog.ts",
    "src/lib/brand-themes.ts",
    "src/components/ui/Button.tsx",
  ])("refuse #0071E3 dans %s", (path) => {
    expect(rules(path, "color: #0071E3;")).toEqual(["bleu-interdit"]);
  });

  it("refuse #0066CC et #2997ff quelle que soit la casse", () => {
    expect(rules("src/app/globals.css", "a { color: #0066cc; }")).toEqual(["bleu-interdit"]);
    expect(rules("src/app/globals.css", "--x: #2997FF;")).toEqual(["bleu-interdit"]);
  });
});

describe("autres motifs interdits dans src/", () => {
  it("refuse getSession(", () => {
    expect(rules("src/lib/auth/dal.ts", "await supabase.auth.getSession()")).toEqual([
      "getSession",
    ]);
  });

  it("refuse une variable publique secrète", () => {
    expect(rules("src/lib/env.ts", "process.env.NEXT_PUBLIC_SUPABASE_SECRET")).toEqual([
      "secret-public",
    ]);
  });

  it('refuse href="#"', () => {
    expect(rules("src/components/layout/SiteFooter.tsx", '<a href="#">FAQ</a>')).toEqual([
      "href-diese",
    ]);
    expect(rules("src/components/layout/SiteFooter.tsx", "<a href={'#'}>FAQ</a>")).toEqual([
      "href-diese",
    ]);
  });

  it("ignore les fichiers hors de src/", () => {
    expect(findViolations("scripts/outil.ts", 'const c = "#0071E3"; getSession();')).toEqual([]);
  });
});

describe("versions exactes dans package.json", () => {
  const pkg = (version: string) => JSON.stringify({ dependencies: { next: version } }, null, 2);

  it.each(["^9", "9", "~4.3.5", "^16.4.6", "4.x", "*", "latest", ">=1.0.0"])(
    'refuse "%s"',
    (version) => {
      expect(rules("package.json", pkg(version))).toEqual(["version-non-exacte"]);
    },
  );

  it.each(["16.4.6", "0.0.1", "7.1.0-dev.20261112.1"])('accepte "%s"', (version) => {
    expect(findViolations("package.json", pkg(version))).toEqual([]);
  });

  it("contrôle aussi les devDependencies", () => {
    const content = JSON.stringify({ devDependencies: { eslint: "^9" } });
    expect(rules("package.json", content)).toEqual(["version-non-exacte"]);
  });
});

describe("dépôt réel", () => {
  it("ne contient aucun motif interdit", () => {
    expect(scanRepository()).toEqual([]);
  });
});
