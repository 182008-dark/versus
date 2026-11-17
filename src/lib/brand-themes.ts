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
 * - `tileThemes`, `brandCardThemes` : couleurs des tuiles et des cartes de marque de la maquette.
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
  /** Dégradé radial du fond : centre, milieu, bord, et position des deux derniers arrêts. */
  from: string;
  via: string;
  to: string;
  viaStop: string;
  toStop: string;
  /** Texte principal et texte secondaire. */
  ink: string;
  muted: string;
  /** Halo lumineux derrière le produit. */
  halo: string;
  /** Anneau de focus, contrasté (≥ 3:1) sur tout le dégradé. */
  ring: string;
  /** Pastilles rondes des commandes (maquette : `.h-btn`, `.dark-ctrl .h-btn`). */
  control: string;
  controlHover: string;
  /** Piste des points (≥ 3:1 sur le fond, WCAG 1.4.11) et barre de progression. */
  track: string;
  fill: string;
  /** Fond sombre (boutons clairs, contrôles clairs) ou clair (boutons sombres). */
  tone: "dark" | "light";
};

/** Diapositives du hero de la maquette (ip18, gw9, rn15). */
export const heroThemes: Record<Brand, HeroTheme> = {
  apple: {
    from: "#4A1420",
    via: "#120507",
    to: "#000000",
    viaStop: "45%",
    toStop: "75%",
    ink: "#F5F5F7",
    muted: "#C7C7CC",
    halo: "#8E2A3E",
    ring: "#3DDC97",
    control: "rgb(255 255 255 / 0.16)",
    controlHover: "rgb(255 255 255 / 0.3)",
    track: "rgb(255 255 255 / 0.7)",
    fill: "#FFFFFF",
    tone: "dark",
  },
  samsung: {
    from: "#2F55FF",
    via: "#1428A0",
    to: "#07103F",
    viaStop: "45%",
    toStop: "85%",
    ink: "#FFFFFF",
    muted: "#D6DDFF",
    halo: "#6F8BFF",
    ring: "#3DDC97",
    control: "rgb(255 255 255 / 0.16)",
    controlHover: "rgb(255 255 255 / 0.3)",
    track: "rgb(255 255 255 / 0.7)",
    fill: "#FFFFFF",
    tone: "dark",
  },
  xiaomi: {
    from: "#FFB27A",
    via: "#FF7A1A",
    to: "#F25C00",
    viaStop: "40%",
    toStop: "85%",
    ink: "#1D1D1F",
    muted: "#3A1A00",
    halo: "#FFE2C7",
    ring: "#1D1D1F",
    control: "rgb(0 0 0 / 0.1)",
    controlHover: "rgb(0 0 0 / 0.18)",
    track: "rgb(29 29 31 / 0.7)",
    fill: "#1D1D1F",
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
    "--hero-via-stop": t.viaStop,
    "--hero-to-stop": t.toStop,
    "--hero-ink": t.ink,
    "--hero-muted": t.muted,
    "--hero-halo": t.halo,
    "--hero-ring": t.ring,
    "--hero-control": t.control,
    "--hero-control-hover": t.controlHover,
    "--hero-track": t.track,
    "--hero-fill": t.fill,
  };
}

/**
 * Thèmes des tuiles promotionnelles (maquette : style en ligne de chaque `.tile`), désignés par
 * `home_slots.theme_key`. `eyebrow` : libellé de gamme affiché quand le produit n'est pas nouveau.
 */
export type TileTheme = {
  background: string;
  ink: string;
  sub: string;
  eyebrow: string;
  eyebrowInk: string;
  /** Lien « En savoir plus ». */
  link: string;
  /** Bouton « Acheter » : variante de Button. */
  button: "light" | "primary" | "brand";
  tone: "dark" | "light";
};

export const tileThemes: Record<string, TileTheme> = {
  "samsung-dark": {
    background: "#000000",
    ink: "#F5F5F7",
    sub: "#A1A1A6",
    eyebrow: "Samsung Galaxy",
    eyebrowInk: "#8AB4FF",
    link: "#3DDC97",
    button: "light",
    tone: "dark",
  },
  "apple-light": {
    background: "#FBFBFD",
    ink: "#1D1D1F",
    sub: "#1D1D1F",
    eyebrow: "Apple",
    eyebrowInk: "#1D1D1F",
    link: "#00805A",
    button: "primary",
    tone: "light",
  },
  "samsung-light": {
    background: "#EEF1FB",
    ink: "#0B1A57",
    sub: "#3A4775",
    eyebrow: "Samsung Galaxy",
    eyebrowInk: "#1428A0",
    link: "#1428A0",
    button: "brand",
    tone: "light",
  },
  "apple-night": {
    background: "#111113",
    ink: "#F5F5F7",
    sub: "#A1A1A6",
    eyebrow: "Apple",
    eyebrowInk: "#F5F5F7",
    link: "#3DDC97",
    button: "light",
    tone: "dark",
  },
  "xiaomi-light": {
    background: "#FFF1E6",
    ink: "#1D1D1F",
    sub: "#5C3A20",
    eyebrow: "Xiaomi",
    eyebrowInk: "#A84300",
    link: "#A84300",
    button: "brand",
    tone: "light",
  },
};

/** Thème d'une tuile, ou celui de la marque du produit quand la clé est inconnue (`default`). */
export function tileTheme(themeKey: string, brand: Brand): TileTheme {
  return tileThemes[themeKey] ?? tileThemes[`${brand}-light`] ?? tileThemes["apple-light"]!;
}

/** Variables CSS inline d'une tuile. */
export function tileStyle(theme: TileTheme): Record<`--tile-${string}`, string> {
  return {
    "--tile-bg": theme.background,
    "--tile-ink": theme.ink,
    "--tile-sub": theme.sub,
    "--tile-eyebrow": theme.eyebrowInk,
    "--tile-link": theme.link,
  };
}

/**
 * Cartes de marque (maquette : `.brand`) : fond, texte, accroche et « Découvrir », et le produit
 * qui les illustre (écart E17 : un visuel propre à chaque univers).
 */
export const brandCardThemes: Record<
  Brand,
  { background: string; ink: string; sub: string; link: string; visual: string }
> = {
  apple: { background: "#000000", ink: "#F5F5F7", sub: "#A1A1A6", link: "#3DDC97", visual: "aw12" },
  samsung: {
    background: "#1428A0",
    ink: "#FFFFFF",
    sub: "#DDE3FF",
    link: "#FFFFFF",
    visual: "gb4",
  },
  xiaomi: { background: "#FF6900", ink: "#1D1D1F", sub: "#3A1A00", link: "#1D1D1F", visual: "rw6" },
};

/** Variables CSS inline d'une carte de marque. */
export function brandCardStyle(brand: Brand): Record<`--card-${string}`, string> {
  const t = brandCardThemes[brand];
  return {
    "--card-bg": t.background,
    "--card-ink": t.ink,
    "--card-sub": t.sub,
    "--card-link": t.link,
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
