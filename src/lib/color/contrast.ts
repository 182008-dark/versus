/**
 * Contraste WCAG 2.2 (critères 1.4.3 et 1.4.11), calculé et non recopié à la main :
 * /styleguide affiche les ratios produits par ces fonctions.
 *
 * Références : https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 *              https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
 */

export type Rgb = { r: number; g: number; b: number };

/** Lit une couleur `#rgb` ou `#rrggbb` (casse indifférente). */
export function parseHex(hex: string): Rgb {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!match?.[1]) throw new Error(`Couleur hexadécimale invalide : « ${hex} »`);
  const digits =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((d) => d + d)
          .join("")
      : match[1];
  return {
    r: Number.parseInt(digits.slice(0, 2), 16),
    g: Number.parseInt(digits.slice(2, 4), 16),
    b: Number.parseInt(digits.slice(4, 6), 16),
  };
}

/** Composante sRGB (0–255) linéarisée. */
function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Luminance relative, de 0 (noir) à 1 (blanc). */
export function relativeLuminance(color: string | Rgb): number {
  const { r, g, b } = typeof color === "string" ? parseHex(color) : color;
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** Ratio de contraste entre deux couleurs, de 1 à 21 (l'ordre des couleurs est indifférent). */
export function contrastRatio(a: string | Rgb, b: string | Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [light, dark] = la > lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}

export type WcagLevel = "AAA" | "AA" | "AA grand texte" | "Insuffisant";

/**
 * Niveau atteint pour du texte. Les seuils s'appliquent au ratio exact (sans arrondi) :
 * 4,499:1 n'atteint pas AA.
 * - texte courant : AA ≥ 4,5 ; AAA ≥ 7 ;
 * - grand texte (≥ 24 px, ou ≥ 18,66 px en gras) : AA ≥ 3 ; AAA ≥ 4,5.
 */
export function wcagLevel(ratio: number, { largeText = false } = {}): WcagLevel {
  if (largeText) {
    if (ratio >= 4.5) return "AAA";
    if (ratio >= 3) return "AA";
    return "Insuffisant";
  }
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA grand texte";
  return "Insuffisant";
}

/** Ratio affiché à la française, tronqué (jamais arrondi vers le haut) : « 4,99:1 ». */
export function formatRatio(ratio: number): string {
  const truncated = Math.floor(ratio * 100) / 100;
  return `${new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(truncated)}:1`;
}
