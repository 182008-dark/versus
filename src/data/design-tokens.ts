/**
 * Copie lisible par TypeScript des tokens de `src/app/globals.css`, pour /styleguide (nuancier,
 * échelles et contrastes mesurés). `design-tokens.test.ts` vérifie que les deux fichiers restent
 * identiques : globals.css reste la source de vérité de l'interface.
 *
 * Fichier de la liste blanche de `check:forbidden` (`src/data/**`).
 */

/** Couche 1 : primitives. Gris « pierre » légèrement verdis depuis la refonte (lot 2). */
export const primitives = {
  white: "#FFFFFF",
  black: "#000000",
  "gray-950": "#1A1D1B",
  "gray-700": "#3F4542",
  "gray-600": "#5C635F",
  "gray-500": "#7D847F",
  "gray-450": "#8A9089",
  "gray-400": "#A8ADA9",
  "gray-300": "#D5D9D6",
  "gray-200": "#E6E9E7",
  "gray-100": "#EEF0EE",
  "gray-50": "#F4F5F3",
  "gray-25": "#FAFBFA",
  "night-950": "#111113",
  "night-900": "#0B0D0C",
  "night-800": "#141715",
  "night-700": "#2C2C2E",
  "green-700": "#006B4B",
  "green-600": "#00805A",
  "green-300": "#3DDC97",
  "green-50": "#E6F4EE",
  "red-700": "#C62828",
  "amber-800": "#8A5A00",
} as const;

export type Primitive = keyof typeof primitives;

/** Couche 2 : rôles sémantiques qui pointent vers une primitive opaque. */
export const semantic = {
  bg: "white",
  ink: "gray-950",
  "ink-strong": "black",
  "on-dark": "white",
  surface: "gray-50",
  "surface-2": "gray-25",
  "surface-hover": "gray-100",
  "surface-dark": "night-900",
  "surface-dark-2": "night-800",
  line: "gray-300",
  "line-soft": "gray-200",
  "line-control": "gray-450",
  muted: "gray-600",
  "muted-strong": "gray-700",
  "muted-on-dark": "gray-400",
  "eyebrow-on-dark": "gray-500",
  accent: "green-600",
  "accent-hover": "green-700",
  "accent-ink": "green-700",
  "accent-on-dark": "green-300",
  "accent-soft": "green-50",
  "on-accent": "white",
  "badge-new-ink": "green-700",
  price: "black",
  danger: "red-700",
  warning: "amber-800",
  "focus-ring": "green-600",
  "notice-bg": "gray-950",
  "notice-ink": "gray-300",
  "header-bg": "white",
} as const satisfies Record<string, Primitive>;

export type SemanticToken = keyof typeof semantic;

/** Valeur hexadécimale d'un token sémantique. */
export function tokenHex(token: SemanticToken): string {
  return primitives[semantic[token]];
}

/** Rôles translucides du premier `:root` (hors nuancier et paires de contraste). */
export const translucent = {
  "line-strong": "rgb(0 0 0 / 0.2)",
  scrim: "rgb(0 0 0 / 0.04)",
  "outline-image": "rgb(0 0 0 / 0.06)",
  "header-bg-translucent": "rgb(255 255 255 / 0.78)",
  "header-line": "rgb(0 0 0 / 0.07)",
  "icon-hover": "rgb(0 0 0 / 0.05)",
} as const;

/**
 * Échelles non colorées, mobile d'abord : valeur de base (`:root`), puis à partir de 641, 901 et
 * 1025 px quand elle change. Les tests comparent chaque palier aux blocs `@media` de globals.css.
 */
export const responsiveScales = {
  "text-hero": { base: "44px", 641: "64px", 1025: "76px" },
  "text-tile": { base: "36px", 641: "48px", 1025: "56px" },
  "text-h2": { base: "32px", 641: "44px", 1025: "48px" },
  "text-brand": { base: "48px", 641: "72px", 1025: "88px" },
  "text-name": { base: "16px", 641: "18px" },
  "text-price-card": { base: "17px", 641: "20px" },
  "text-price-lead": { base: "22px", 641: "28px" },
  "text-quiz": { base: "24px", 641: "30px" },
  "text-sub": { base: "17px", 641: "19px" },
  "space-section": { base: "64px", 901: "96px" },
  gutter: { base: "16px", 641: "24px" },
} as const satisfies Record<string, { base: string } & Partial<Record<641 | 901 | 1025, string>>>;

/** Durées du mouvement (`--dur-*`). */
export const durations = {
  "dur-fast": "150ms",
  "dur-base": "220ms",
  "dur-slow": "400ms",
} as const;

/** Autres tokens non colorés du premier `:root`. */
export const layoutTokens = { "header-height": "56px" } as const;

/** Arrondis : trois valeurs depuis la refonte (lot 2). Classe Tailwind `rounded-<nom>`. */
export const radii = { tile: "28px", card: "20px", control: "12px" } as const;

/** Alias temporaires de la migration (7 arrondis → 3) : ancien nom → nouveau. */
export const radiusAliases = {
  box: "tile",
  result: "card",
  option: "control",
  icon: "control",
  chip: "control",
} as const satisfies Record<string, keyof typeof radii>;

export type ContrastPair = {
  /** Usage dans l'interface. */
  usage: string;
  fg: SemanticToken;
  bg: SemanticToken;
  /** Grand texte (≥ 24 px, ou ≥ 18,66 px en gras) : seuil AA de 3:1. */
  largeText?: boolean;
  /** Élément non textuel (anneau de focus, bordure) : seuil de 3:1 (critère 1.4.11). */
  nonText?: boolean;
};

/**
 * Paires texte / fond utilisées par l'interface, mesurées dans /styleguide et verrouillées par
 * `design-tokens.test.ts` (seuil AA). Chaque rôle de texte employé en classe `text-*` dans `src/`
 * doit figurer ici (test). Les couleurs de marque sont testées dans `brand-themes.test.ts`.
 */
export const contrastPairs: ContrastPair[] = [
  { usage: "Lien et texte accent sur fond blanc", fg: "accent", bg: "bg" },
  { usage: "Lien accent sur surface très claire (styleguide)", fg: "accent", bg: "surface-2" },
  { usage: "Texte vert sur surface grise : vert foncé", fg: "accent-ink", bg: "surface" },
  { usage: "Texte vert sur gris de survol : vert foncé", fg: "accent-ink", bg: "surface-hover" },
  { usage: "Vert foncé sur fond blanc", fg: "accent-ink", bg: "bg" },
  { usage: "Bouton principal : texte blanc sur accent", fg: "on-accent", bg: "accent" },
  { usage: "Bouton principal survolé", fg: "on-accent", bg: "accent-hover" },
  { usage: "Lien accent survolé sur fond blanc", fg: "accent-hover", bg: "bg" },
  { usage: "Badge « Nouveau » (capsule accent-soft)", fg: "badge-new-ink", bg: "accent-soft" },
  {
    usage: "Accent sur fond sombre (quiz, tuiles noires)",
    fg: "accent-on-dark",
    bg: "surface-dark",
  },
  { usage: "Accent sur fond sombre secondaire", fg: "accent-on-dark", bg: "surface-dark-2" },
  { usage: "Anneau de focus sur fond blanc", fg: "focus-ring", bg: "bg", nonText: true },
  { usage: "Anneau de focus sur surface grise", fg: "focus-ring", bg: "surface", nonText: true },
  {
    usage: "Contour d'un contrôle non sélectionné sur fond blanc",
    fg: "line-control",
    bg: "bg",
    nonText: true,
  },
  {
    usage: "Contour d'un contrôle sur surface très claire",
    fg: "line-control",
    bg: "surface-2",
    nonText: true,
  },
  { usage: "Texte courant", fg: "ink", bg: "bg" },
  { usage: "Texte courant sur surface grise", fg: "ink", bg: "surface" },
  { usage: "Texte courant sur gris de survol", fg: "ink", bg: "surface-hover" },
  { usage: "Texte renforcé (survol d'un lien)", fg: "ink-strong", bg: "bg" },
  { usage: "Prix sur fond blanc", fg: "price", bg: "bg" },
  { usage: "Prix sur surface grise", fg: "price", bg: "surface" },
  { usage: "Texte secondaire sur fond blanc", fg: "muted", bg: "bg" },
  { usage: "Texte secondaire du pied de page", fg: "muted", bg: "surface" },
  { usage: "Texte secondaire sur surface très claire", fg: "muted", bg: "surface-2" },
  { usage: "Liens du pied de page, « Dès » et « FCFA »", fg: "muted-strong", bg: "surface" },
  { usage: "« Dès » et « FCFA » sur fond blanc", fg: "muted-strong", bg: "bg" },
  { usage: "Bandeau « Projet pédagogique »", fg: "notice-ink", bg: "notice-bg" },
  { usage: "Texte sur fond sombre", fg: "on-dark", bg: "surface-dark" },
  { usage: "Texte sur fond sombre secondaire", fg: "on-dark", bg: "surface-dark-2" },
  { usage: "Texte de l'encre (médaillon VS)", fg: "on-dark", bg: "ink" },
  { usage: "Lien clair sur fond sombre (TextLink light)", fg: "surface", bg: "surface-dark" },
  { usage: "Texte secondaire sur fond sombre", fg: "muted-on-dark", bg: "surface-dark" },
  {
    usage: "Texte secondaire sur fond sombre secondaire",
    fg: "muted-on-dark",
    bg: "surface-dark-2",
  },
  { usage: "Surtitre sur fond sombre", fg: "eyebrow-on-dark", bg: "surface-dark" },
  { usage: "Erreur sur fond blanc", fg: "danger", bg: "bg" },
  { usage: "Avertissement sur fond blanc", fg: "warning", bg: "bg" },
];
