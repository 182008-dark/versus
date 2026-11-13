/**
 * Couleurs de marque (§4.1 du plan) : elles relèvent du design, donc du code, pas de la base.
 *
 * Fichier de la liste blanche de `check:forbidden` : c'est l'un des rares endroits où un
 * littéral hexadécimal est permis. Les trois bleus Apple de la maquette (voir check-forbidden.mjs)
 * y restent interdits : l'accent Apple devient le noir de la marque (§4.2).
 *
 * - `brandThemes` : fond, encre et accent de chaque marque. Les mêmes valeurs sont exposées en
 *   CSS par `[data-brand="…"]` dans `globals.css` (un test vérifie qu'elles sont identiques).
 * - `heroThemes` : dégradés et couleurs des diapositives du hero, injectés en variables inline
 *   (`style={{ "--hero-from": … }}`) par HeroSlide (étape 3).
 * - `fallbackVisuals` : couleurs du SVG de secours de ProductVisual (repris de Device.dc.html).
 */

export const BRANDS = ["apple", "samsung", "xiaomi"] as const;
export type Brand = (typeof BRANDS)[number];

export type BrandTheme = {
  label: string;
  /** Fond des cartes et tuiles de la marque. */
  ground: string;
  /** Encre (nom de marque, liens) sur `ground`. */
  ink: string;
  /** Couleur d'action de la marque (bouton « brand »). */
  acc: string;
  /** Texte posé sur `acc`. */
  onAcc: string;
};

export const brandThemes: Record<Brand, BrandTheme> = {
  apple: { label: "Apple", ground: "#F5F5F7", ink: "#1D1D1F", acc: "#1D1D1F", onAcc: "#FFFFFF" },
  samsung: {
    label: "Samsung",
    ground: "#EEF1FB",
    ink: "#1428A0",
    acc: "#1428A0",
    onAcc: "#FFFFFF",
  },
  xiaomi: { label: "Xiaomi", ground: "#FFF1E6", ink: "#A84300", acc: "#FF6900", onAcc: "#1D1D1F" },
};

export type HeroTheme = {
  /** Dégradé radial du fond : centre, milieu, bord. */
  from: string;
  via: string;
  to: string;
  /** Texte principal et texte secondaire. */
  ink: string;
  muted: string;
  /** Halo lumineux derrière le produit. */
  halo: string;
  /** Fond sombre (boutons clairs, contrôles clairs) ou clair (boutons sombres). */
  tone: "dark" | "light";
};

/** Diapositives du hero de la maquette (ip18, gw9, rn15). */
export const heroThemes: Record<Brand, HeroTheme> = {
  apple: {
    from: "#4A1420",
    via: "#120507",
    to: "#000000",
    ink: "#F5F5F7",
    muted: "#C7C7CC",
    halo: "#8E2A3E",
    tone: "dark",
  },
  samsung: {
    from: "#2F55FF",
    via: "#1428A0",
    to: "#07103F",
    ink: "#FFFFFF",
    muted: "#D6DDFF",
    halo: "#6F8BFF",
    tone: "dark",
  },
  xiaomi: {
    from: "#FFB27A",
    via: "#FF7A1A",
    to: "#F25C00",
    ink: "#1D1D1F",
    muted: "#3A1A00",
    halo: "#FFE2C7",
    tone: "light",
  },
};

/** Variables CSS inline d'une diapositive du hero (aucune couleur en dur dans le JSX). */
export function heroStyle(brand: Brand): Record<`--hero-${string}`, string> {
  const t = heroThemes[brand];
  return {
    "--hero-from": t.from,
    "--hero-via": t.via,
    "--hero-to": t.to,
    "--hero-ink": t.ink,
    "--hero-muted": t.muted,
    "--hero-halo": t.halo,
  };
}

export type DeviceKind = "phone" | "watch" | "round" | "buds" | "band";

/** Couleurs fixes du SVG de secours (Device.dc.html), communes à tous les produits. */
export const fallbackVisuals = {
  shadow: "#000000",
  sheenLight: "#FFFFFF",
  sheenDark: "#000000",
  lens: "#0B0B0D",
  lensInner: "#1E2230",
  lensGlint: "#8A93B8",
  flash: "#F2EBD8",
  screen: "#050506",
  ringMove: "#FF375F",
  ringMoveTrack: "#2A0F14",
  ringExercise: "#30D158",
  ringExerciseTrack: "#0F2A14",
  ringRound: "#4C7BFF",
  ringRoundTrack: "#0E1A3D",
  bandDot: "#FFFFFF",
} as const;

/** Accent par défaut du SVG de secours (la maquette utilisait le bleu Apple, désormais interdit). */
export const fallbackAccent: Record<Brand, string> = {
  apple: "#1D1D1F",
  samsung: "#1428A0",
  xiaomi: "#FF6900",
};
