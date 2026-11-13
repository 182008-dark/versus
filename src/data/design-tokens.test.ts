// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio, wcagLevel } from "@/lib/color/contrast";
import { contrastPairs, primitives, semantic, tokenHex, type SemanticToken } from "./design-tokens";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

/** Déclarations du premier bloc `:root { … }` de globals.css (tokens de base, mobile d'abord). */
function rootDeclarations(): Map<string, string> {
  const block = /:root\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? "";
  const declarations = new Map<string, string>();
  for (const [, name, value] of block.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    if (name && value) declarations.set(name, value.trim());
  }
  return declarations;
}

/** Déclarations `--color-*` du bloc `@theme inline` (pont Tailwind). */
function themeColorBridges(): Map<string, string> {
  const block = /@theme inline\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? "";
  const bridges = new Map<string, string>();
  for (const [, name, value] of block.matchAll(/--color-([\w-]+)\s*:\s*([^;]+);/g)) {
    if (name && value) bridges.set(name, value.trim());
  }
  return bridges;
}

/**
 * Tokens du premier `:root` qui ne sont pas des couleurs opaques : ils n'ont pas leur place dans
 * le nuancier ni dans les paires de contraste. Tout autre token doit figurer dans
 * design-tokens.ts (primitive ou rôle sémantique).
 */
const NOT_OPAQUE_COLORS = new Set([
  "line-strong",
  "header-bg-translucent",
  "header-line",
  "icon-hover",
  "header-height",
  "text-hero",
  "text-tile",
  "text-h2",
  "text-quiz",
  "text-sub",
]);

/** Tokens définis hors du premier `:root` (thèmes `[data-brand]`), visés par le pont Tailwind. */
const BRAND_TOKENS = new Set(["brand-ground", "brand-ink", "brand-acc", "brand-on-acc"]);

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

  it("chaque token de globals.css est recopié dans design-tokens.ts (sens inverse)", () => {
    const missing: string[] = [];
    for (const [name, value] of declarations) {
      if (HEX.test(value)) {
        if (!(name in primitives)) missing.push(`--${name} (primitive ${value})`);
      } else if (HEX.test(resolve(declarations, name))) {
        if (!(name in semantic)) missing.push(`--${name} (rôle sémantique ${value})`);
      } else if (!NOT_OPAQUE_COLORS.has(name)) {
        missing.push(`--${name} (${value}) : ni couleur opaque, ni exception déclarée`);
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
      const known = target !== undefined && (declarations.has(target) || BRAND_TOKENS.has(target));
      if (!known || target in primitives) invalid.push(`--color-${name}: ${value}`);
    }
    expect(invalid).toEqual([]);
  });

  it("contient l'accent vert VERSUS de la décision D1", () => {
    expect(tokenHex("accent")).toBe("#00805A");
    expect(tokenHex("accent-hover")).toBe("#006B4B");
    expect(tokenHex("accent-on-dark")).toBe("#3DDC97");
    expect(tokenHex("accent-soft")).toBe("#E6F4EE");
  });
});

describe("contrastes mesurés (critère de l'étape 2)", () => {
  it.each(contrastPairs.map((p) => [p.usage, p] as const))("%s atteint AA", (_usage, pair) => {
    const ratio = contrastRatio(tokenHex(pair.fg), tokenHex(pair.bg));
    if (pair.nonText || pair.largeText) {
      expect(ratio).toBeGreaterThanOrEqual(3);
    } else {
      expect(wcagLevel(ratio)).toMatch(/^AA/);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });
});
