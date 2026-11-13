/**
 * Copie lisible par TypeScript des tokens de couleur de `src/app/globals.css`, pour /styleguide
 * (nuancier et contrastes mesurés). `design-tokens.test.ts` vérifie que les deux fichiers restent
 * identiques : globals.css reste la source de vérité de l'interface.
 *
 * Fichier de la liste blanche de `check:forbidden` (`src/data/**`).
 */

/** Couche 1 : primitives (maquette et accent VERSUS). */
export const primitives = {
  white: "#FFFFFF",
  black: "#000000",
  "gray-950": "#1D1D1F",
  "gray-700": "#424245",
  "gray-600": "#6E6E73",
  "gray-500": "#86868B",
  "gray-400": "#A1A1A6",
  "gray-300": "#D2D2D7",
  "gray-200": "#EDEDF0",
  "gray-100": "#EAEAEE",
  "gray-50": "#F5F5F7",
  "gray-25": "#FBFBFD",
  "night-950": "#111113",
  "night-900": "#0B0B0C",
  "night-800": "#1C1C1E",
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
  muted: "gray-600",
  "muted-strong": "gray-700",
  "muted-on-dark": "gray-400",
  "eyebrow-on-dark": "gray-500",
  accent: "green-600",
  "accent-hover": "green-700",
  "accent-on-dark": "green-300",
  "accent-soft": "green-50",
  "on-accent": "white",
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

/** Paires mesurées dans /styleguide (accent d'abord : critère de l'étape 2). */
export const contrastPairs: ContrastPair[] = [
  { usage: "Lien et texte accent sur fond blanc", fg: "accent", bg: "bg" },
  { usage: "Bouton principal : texte blanc sur accent", fg: "on-accent", bg: "accent" },
  { usage: "Bouton principal survolé", fg: "on-accent", bg: "accent-hover" },
  { usage: "Lien accent survolé sur fond blanc", fg: "accent-hover", bg: "bg" },
  { usage: "Badge « Nouveau » (capsule accent-soft)", fg: "accent-hover", bg: "accent-soft" },
  { usage: "Lien accent sur surface grise", fg: "accent", bg: "surface" },
  {
    usage: "Accent sur fond sombre (quiz, tuiles noires)",
    fg: "accent-on-dark",
    bg: "surface-dark",
  },
  { usage: "Accent sur fond sombre secondaire", fg: "accent-on-dark", bg: "surface-dark-2" },
  { usage: "Anneau de focus sur fond blanc", fg: "focus-ring", bg: "bg", nonText: true },
  { usage: "Anneau de focus sur surface grise", fg: "focus-ring", bg: "surface", nonText: true },
  { usage: "Texte courant", fg: "ink", bg: "bg" },
  { usage: "Texte secondaire sur fond blanc", fg: "muted", bg: "bg" },
  { usage: "Texte secondaire du pied de page", fg: "muted", bg: "surface" },
  { usage: "Liens du pied de page", fg: "muted-strong", bg: "surface" },
  { usage: "Bandeau « Projet pédagogique »", fg: "notice-ink", bg: "notice-bg" },
  { usage: "Texte secondaire sur fond sombre", fg: "muted-on-dark", bg: "surface-dark" },
  { usage: "Erreur sur fond blanc", fg: "danger", bg: "bg" },
  { usage: "Avertissement sur fond blanc", fg: "warning", bg: "bg" },
];
