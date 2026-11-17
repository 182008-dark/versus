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

/** Couleur `rgb(r g b / a)` composée sur un fond opaque (piste semi-transparente des points). */
function over(color: string, background: string) {
  const match = /rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)/.exec(color);
  if (!match) return color;
  const [r, g, b, alpha] = match.slice(1).map(Number) as [number, number, number, number];
  const bg = background.replace("#", "");
  const channel = (index: number, value: number) =>
    Math.round(value * alpha + Number.parseInt(bg.slice(index, index + 2), 16) * (1 - alpha));
  return { r: channel(0, r), g: channel(2, g), b: channel(4, b) };
}

describe("hero : anneau de focus et points lisibles sur chaque dégradé (WCAG 1.4.11)", () => {
  it.each(BRANDS)("%s : anneau et piste à au moins 3:1 sur les trois arrêts", (brand) => {
    const theme = heroThemes[brand];
    for (const stop of [theme.from, theme.via, theme.to]) {
      expect(contrastRatio(theme.ring, stop), `anneau sur ${stop}`).toBeGreaterThanOrEqual(3);
      expect(
        contrastRatio(over(theme.track, stop), stop),
        `piste sur ${stop}`,
      ).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(theme.fill, stop), `barre sur ${stop}`).toBeGreaterThanOrEqual(3);
    }
  });
});
