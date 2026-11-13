// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { primitives } from "@/data/design-tokens";
import { BRANDS, brandThemes, fallbackAccent, heroStyle, heroThemes } from "./brand-themes";
import { contrastRatio } from "./color/contrast";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const source = readFileSync(join(process.cwd(), "src/lib/brand-themes.ts"), "utf8");

function brandBlock(brand: string): Record<string, string> {
  const block = new RegExp(`\\[data-brand="${brand}"\\]\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? "";
  return Object.fromEntries(
    [...block.matchAll(/--brand-([\w-]+)\s*:\s*([^;]+);/g)].map(([, k, v]) => [
      k,
      (v ?? "").trim().toUpperCase(),
    ]),
  );
}

describe("thèmes de marque", () => {
  it.each(BRANDS)("[data-brand=%s] de globals.css reprend brand-themes.ts", (brand) => {
    const t = brandThemes[brand];
    expect(brandBlock(brand)).toEqual({
      ground: t.ground,
      ink: t.ink,
      acc: t.acc,
      "on-acc": t.onAcc,
    });
  });

  it.each(BRANDS)("le texte de la marque %s est lisible (AA)", (brand) => {
    const t = brandThemes[brand];
    expect(contrastRatio(t.ink, t.ground)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.onAcc, t.acc)).toBeGreaterThanOrEqual(4.5);
  });

  it("l'accent Apple est le noir de la marque, pas le bleu de la maquette (§4.2)", () => {
    expect(brandThemes.apple.acc).toBe(primitives["gray-950"]);
    expect(fallbackAccent.apple).toBe(primitives["gray-950"]);
    expect(source).not.toMatch(/#(?:0071e3|0066cc|2997ff)/i);
  });

  it("heroStyle expose le dégradé en variables CSS", () => {
    expect(heroStyle("samsung")).toMatchObject({
      "--hero-from": heroThemes.samsung.from,
      "--hero-via": heroThemes.samsung.via,
      "--hero-to": heroThemes.samsung.to,
    });
  });
});
