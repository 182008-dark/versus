// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio, wcagLevel } from "@/lib/color/contrast";
import {
  contrastPairs,
  durations,
  layoutTokens,
  primitives,
  radii,
  radiusAliases,
  responsiveScales,
  semantic,
  tokenHex,
  translucent,
  type SemanticToken,
} from "./design-tokens";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

function declarationsOf(block: string, prefix = ""): Map<string, string> {
  const declarations = new Map<string, string>();
  for (const [, name, value] of block.matchAll(
    new RegExp(`--${prefix}([\\w-]+)\\s*:\\s*([^;]+);`, "g"),
  )) {
    if (name && value) declarations.set(name, value.trim());
  }
  return declarations;
}

/** Déclarations du premier bloc `:root { … }` de globals.css (tokens de base, mobile d'abord). */
function rootDeclarations(): Map<string, string> {
  return declarationsOf(/:root\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? "");
}

/** Déclarations du `:root` placé sous `@media (min-width: <px>px)`. */
function mediaDeclarations(px: number): Map<string, string> {
  const pattern = new RegExp(`@media \\(min-width: ${px}px\\) \\{\\s*:root \\{([^}]*)\\}`);
  return declarationsOf(pattern.exec(css)?.[1] ?? "");
}

function block(selector: RegExp): string {
  return selector.exec(css)?.[1] ?? "";
}

/** Déclarations `--color-*` du bloc `@theme inline` (pont Tailwind). */
function themeColorBridges(): Map<string, string> {
  return declarationsOf(block(/@theme inline\s*\{([\s\S]*?)\n\}/), "color-");
}

/** Déclarations `--radius-*` du bloc `@theme` (non inline). */
function themeRadii(): Map<string, string> {
  return declarationsOf(block(/@theme\s*\{([\s\S]*?)\n\}/), "radius-");
}

/** Tokens définis hors du premier `:root` (thèmes `[data-brand]`), visés par le pont Tailwind. */
const BRAND_TOKENS = new Set(["brand-ground", "brand-ink", "brand-mark"]);

const HEX = /^#[0-9a-f]{3,8}$/i;

/** Résout `var(--x)` jusqu'à une valeur littérale. */
function resolve(declarations: Map<string, string>, name: string, depth = 0): string {
  const value = declarations.get(name);
  if (value === undefined) throw new Error(`--${name} absent de globals.css`);
  const ref = /^var\(--([\w-]+)\)$/.exec(value);
  if (ref?.[1] && depth < 10) return resolve(declarations, ref[1], depth + 1);
  return value;
}

describe("design-tokens.ts reste identique à globals.css", () => {
  const declarations = rootDeclarations();

  it.each(Object.entries(primitives))("primitive --%s", (name, hex) => {
    expect(declarations.get(name)?.toUpperCase()).toBe(hex.toUpperCase());
  });

  it.each(Object.keys(semantic) as SemanticToken[])("token sémantique --%s", (token) => {
    expect(resolve(declarations, token).toUpperCase()).toBe(tokenHex(token).toUpperCase());
  });

  it.each(Object.entries(translucent))("rôle translucide --%s", (name, value) => {
    expect(declarations.get(name)).toBe(value);
  });

  it.each(Object.entries({ ...durations, ...layoutTokens }))("token --%s", (name, value) => {
    expect(declarations.get(name)).toBe(value);
  });

  it.each(Object.entries(responsiveScales))("échelle --%s à chaque palier", (name, scale) => {
    expect(declarations.get(name), "valeur de base").toBe(scale.base);
    for (const px of [641, 901, 1025] as const) {
      const expected = (scale as Partial<Record<number, string>>)[px];
      expect(mediaDeclarations(px).get(name), `à partir de ${px} px`).toBe(expected);
    }
  });

  it("chaque token de globals.css est recopié dans design-tokens.ts (sens inverse)", () => {
    const known = new Set([
      ...Object.keys(translucent),
      ...Object.keys(durations),
      ...Object.keys(layoutTokens),
      ...Object.keys(responsiveScales),
    ]);
    const missing: string[] = [];
    for (const [name, value] of declarations) {
      if (HEX.test(value)) {
        if (!(name in primitives)) missing.push(`--${name} (primitive ${value})`);
      } else if (HEX.test(resolve(declarations, name))) {
        if (!(name in semantic)) missing.push(`--${name} (rôle sémantique ${value})`);
      } else if (!known.has(name)) {
        missing.push(`--${name} (${value}) : absent de design-tokens.ts`);
      }
    }
    for (const px of [641, 901, 1025]) {
      for (const name of mediaDeclarations(px).keys()) {
        if (!(name in responsiveScales)) missing.push(`--${name} (palier ${px} px)`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("le pont Tailwind ne renvoie qu'à des rôles sémantiques connus, jamais à une primitive", () => {
    const bridges = themeColorBridges();
    expect(bridges.size).toBeGreaterThan(0);
    const invalid: string[] = [];
    for (const [name, value] of bridges) {
      if (name === "*") continue; // `--color-*: initial` retire la palette par défaut.
      const target = /^var\(--([\w-]+)\)$/.exec(value)?.[1];
      const ok = target !== undefined && (declarations.has(target) || BRAND_TOKENS.has(target));
      if (!ok || target in primitives) invalid.push(`--color-${name}: ${value}`);
    }
    expect(invalid).toEqual([]);
  });

  it("les couleurs d'action de marque sont retirées (une marque ne sert jamais à une action)", () => {
    expect(css).not.toMatch(/--brand-acc|--brand-on-acc/);
  });

  it("contient l'accent vert VERSUS de la décision D1 et le vert foncé des fonds gris", () => {
    expect(tokenHex("accent")).toBe("#00805A");
    expect(tokenHex("accent-hover")).toBe("#006B4B");
    expect(tokenHex("accent-ink")).toBe("#006B4B");
    expect(tokenHex("badge-new-ink")).toBe("#006B4B");
    expect(tokenHex("accent-on-dark")).toBe("#3DDC97");
    expect(tokenHex("accent-soft")).toBe("#E6F4EE");
  });
});

describe("arrondis : trois valeurs et des alias temporaires", () => {
  const theme = themeRadii();

  it.each(Object.entries(radii))("--radius-%s", (name, value) => {
    expect(theme.get(name)).toBe(value);
  });

  it.each(Object.entries(radiusAliases))("alias --radius-%s = --radius-%s", (alias, target) => {
    expect(theme.get(alias)).toBe(radii[target]);
  });

  it("aucun autre arrondi n'est déclaré", () => {
    expect([...theme.keys()].sort()).toEqual(
      [...Object.keys(radii), ...Object.keys(radiusAliases)].sort(),
    );
  });
});

describe("contrastes mesurés (AA)", () => {
  it.each(contrastPairs.map((p) => [p.usage, p] as const))("%s atteint AA", (_usage, pair) => {
    const ratio = contrastRatio(tokenHex(pair.fg), tokenHex(pair.bg));
    if (pair.nonText || pair.largeText) {
      expect(ratio).toBeGreaterThanOrEqual(3);
    } else {
      expect(wcagLevel(ratio)).toMatch(/^AA/);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("le vert VERSUS ne suffit pas sur le gris de survol : texte vert sur gris = --accent-ink", () => {
    expect(contrastRatio(tokenHex("accent"), tokenHex("surface-hover"))).toBeLessThan(4.5);
    for (const ground of ["surface", "surface-2", "surface-hover"] as const) {
      expect(
        contrastRatio(tokenHex("accent-ink"), tokenHex(ground)),
        ground,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("--gray-500 reste décoratif (moins de 4,5:1 sur blanc) et --line-control évite --surface", () => {
    expect(contrastRatio(primitives["gray-500"], primitives.white)).toBeLessThan(4.5);
    expect(contrastRatio(tokenHex("line-control"), tokenHex("surface"))).toBeLessThan(3);
  });
});

/** Fichiers .ts/.tsx de src/, hors tests. */
function sourceFiles(dir = join(process.cwd(), "src")): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [path] : [];
  });
}

describe("chaque rôle employé comme couleur de texte a sa paire de contraste", () => {
  it("toute classe text-<rôle> de src/ figure dans contrastPairs (ou est une encre de marque)", () => {
    const bridges = themeColorBridges();
    const measured = new Set(contrastPairs.map((pair) => pair.fg));
    const used = new Set<string>();
    for (const file of sourceFiles()) {
      for (const [, role] of readFileSync(file, "utf8").matchAll(/(?<![\w-])text-([a-z][\w-]*)/g)) {
        if (role && bridges.has(role)) used.add(role);
      }
    }
    expect(used.size).toBeGreaterThan(5);
    const orphans = [...used].filter(
      (role) => !measured.has(role as SemanticToken) && !role.startsWith("brand-"),
    );
    expect(orphans).toEqual([]);
  });
});
