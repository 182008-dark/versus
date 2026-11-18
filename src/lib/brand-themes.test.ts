// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { primitives, tokenHex } from "@/data/design-tokens";
import {
  BRANDS,
  brandCardThemes,
  brandThemes,
  fallbackAccent,
  heroStyle,
  heroThemes,
  tileThemes,
} from "./brand-themes";
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
    expect(brandBlock(brand)).toEqual({ ground: t.ground, ink: t.ink, mark: t.mark });
  });

  it.each(BRANDS)("l'encre de la marque %s est lisible (AA) partout où elle se pose", (brand) => {
    const t = brandThemes[brand];
    expect(contrastRatio(t.ink, t.ground), "sur le fond pastel").toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.ink, tokenHex("bg")), "sur blanc").toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.ink, tokenHex("surface")), "sur la surface").toBeGreaterThanOrEqual(4.5);
  });

  it.each(BRANDS)("le texte secondaire et le prix restent lisibles sur le fond %s", (brand) => {
    const ground = brandThemes[brand].ground;
    for (const role of ["muted", "muted-strong", "ink", "price", "accent-ink"] as const) {
      expect(contrastRatio(tokenHex(role), ground), role).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("la pastille orange de Xiaomi est décorative : jamais un texte (moins de 3:1 sur blanc)", () => {
    expect(contrastRatio(brandThemes.xiaomi.mark, tokenHex("bg"))).toBeLessThan(3);
  });

  it("l'encre Apple est l'encre VERSUS, pas le bleu de la maquette (§4.2)", () => {
    expect(brandThemes.apple.ink).toBe(primitives["gray-950"]);
    expect(brandThemes.apple.mark).toBe(primitives["gray-950"]);
    expect(fallbackAccent.apple).toBe(primitives["gray-950"]);
    expect(source).not.toMatch(/#(?:0071e3|0066cc|2997ff)/i);
  });

  it.each(BRANDS)("la tuile claire %s reprend le fond pastel et l'encre de la marque", (brand) => {
    const tile = tileThemes[`${brand}-light`];
    expect(tile?.background).toBe(brandThemes[brand].ground);
    // Le badge de marque (BrandMark, encre de la marque) reste lisible sur la tuile claire.
    expect(contrastRatio(brandThemes[brand].ink, tile!.background)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(BRANDS)("la carte d'univers %s reste pastel avec un texte contrasté", (brand) => {
    const card = brandCardThemes[brand];
    expect(card.background).toBe(brandThemes[brand].ground);
    expect(card.mark).toBe(brandThemes[brand].mark);
    for (const role of ["ink", "sub", "link"] as const) {
      expect(contrastRatio(card[role], card.background), role).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(Object.keys(tileThemes))("les textes de la tuile %s sont lisibles (AA)", (key) => {
    const tile = tileThemes[key]!;
    for (const role of ["ink", "sub"] as const) {
      expect(contrastRatio(tile[role], tile.background), role).toBeGreaterThanOrEqual(4.5);
    }
    // Badge de marque blanc (BrandMark onDark) sur une tuile sombre.
    if (tile.tone === "dark") {
      expect(contrastRatio(tokenHex("on-dark"), tile.background)).toBeGreaterThanOrEqual(4.5);
    }
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
