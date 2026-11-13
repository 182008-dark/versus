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
