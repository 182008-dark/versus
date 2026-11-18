import { lineName } from "@/lib/cart/cart-messages";
import type { ProductVariant } from "./types";

/**
 * Choix de la variante sur la fiche (coloris, capacité, taille), en fonctions pures exécutées par
 * le serveur (`variantViews`) pour l'îlot `VariantPicker`. Seules les variantes actives comptent ;
 * la lecture de l'adresse côté navigateur est dans `variant-search.ts`.
 */
export type PickerVariant = Pick<
  ProductVariant,
  | "sku"
  | "color_name"
  | "color_slug"
  | "color_hex"
  | "storage_gb"
  | "size_mm"
  | "price_fcfa"
  | "stock"
  | "is_default"
>;

export type VariantOption = {
  /** Valeur distinctive du groupe (slug de coloris, capacité, taille). */
  value: string;
  label: string;
  /** Variante sélectionnée quand on choisit cette option. */
  sku: string;
  selected: boolean;
  soldOut: boolean;
  /** Couleur d'aperçu (coloris seulement). */
  hex: string | null;
};

export type VariantGroup = {
  key: "color" | "storage" | "size";
  legend: string;
  selectedLabel: string;
  options: VariantOption[];
};

const storageLabel = (gb: number) => (gb >= 1024 ? `${gb / 1024} To` : `${gb} Go`);
const sizeLabel = (mm: number) => `${mm} mm`;
/** Partie « 256 Go », « 1 To » ou « 40 mm » d'un nom de variante. */
const DIMENSION = /^\d+ (?:Go|To|mm)$/;

/** Nom du coloris seul : « Bordeaux · 256 Go » → « Bordeaux » ; « 40 mm · Graphite » → « Graphite ». */
export function colorLabel(variant: Pick<ProductVariant, "color_name">): string {
  return variant.color_name
    .split(" · ")
    .filter((part) => !DIMENSION.test(part))
    .join(" · ");
}

/** Variante affichée d'abord : celle par défaut si elle est en stock, sinon la première en stock. */
export function initialVariant<T extends PickerVariant>(variants: readonly T[]): T {
  const fallback = variants.find((variant) => variant.is_default) ?? variants[0];
  if (!fallback) throw new Error("Aucune variante active.");
  return fallback.stock > 0 ? fallback : (variants.find((v) => v.stock > 0) ?? fallback);
}

/** Meilleure variante pour un critère : celle qui garde le plus du choix actuel, en stock d'abord. */
function closest<T extends PickerVariant>(candidates: readonly T[], selected: PickerVariant): T {
  const score = (variant: T) =>
    (variant.color_slug === selected.color_slug ? 4 : 0) +
    (variant.storage_gb === selected.storage_gb ? 2 : 0) +
    (variant.size_mm === selected.size_mm ? 2 : 0) +
    (variant.stock > 0 ? 1 : 0);
  return candidates.reduce((best, variant) => (score(variant) > score(best) ? variant : best));
}

function group<T extends PickerVariant>(
  variants: readonly T[],
  selected: T,
  key: VariantGroup["key"],
  legend: string,
  valueOf: (variant: T) => number | string | null,
  labelOf: (variant: T) => string,
): VariantGroup | null {
  // Capacités et tailles : celles du coloris choisi ; coloris : tous.
  const pool =
    key === "color" ? variants : variants.filter((v) => v.color_slug === selected.color_slug);
  const values = [...new Set(pool.map(valueOf))].filter((value) => value !== null);
  if (values.length === 0) return null;
  if (key !== "color") values.sort((a, b) => Number(a) - Number(b));
  const options = values.map((value): VariantOption => {
    const target = closest(
      pool.filter((variant) => valueOf(variant) === value),
      selected,
    );
    return {
      value: String(value),
      label: labelOf(target),
      sku: target.sku,
      selected: valueOf(selected) === value,
      soldOut: target.stock === 0,
      hex: key === "color" ? target.color_hex : null,
    };
  });
  return { key, legend, selectedLabel: labelOf(selected), options };
}

/** Groupes à afficher pour la variante choisie : coloris, puis capacité ou taille. */
export function variantGroups<T extends PickerVariant>(
  variants: readonly T[],
  selected: T,
): VariantGroup[] {
  return [
    group(variants, selected, "color", "Coloris", (v) => v.color_slug, colorLabel),
    group(
      variants,
      selected,
      "storage",
      "Capacité",
      (v) => v.storage_gb,
      (v) => storageLabel(v.storage_gb ?? 0),
    ),
    group(
      variants,
      selected,
      "size",
      "Taille du boîtier",
      (v) => v.size_mm,
      (v) => sizeLabel(v.size_mm ?? 0),
    ),
  ].filter((item) => item !== null);
}

/** `?couleur=bordeaux&stockage=512` : adresse partageable de la variante (§3.2). */
export function variantSearch(variant: PickerVariant): string {
  const params = new URLSearchParams({ couleur: variant.color_slug });
  if (variant.storage_gb !== null) params.set("stockage", String(variant.storage_gb));
  if (variant.size_mm !== null) params.set("taille", String(variant.size_mm));
  return `?${params}`;
}

/**
 * Tout ce que l'îlot VariantPicker affiche pour une variante, calculé par le serveur : le
 * navigateur ne reçoit que ces données (adresse, nom, groupes d'options, texte de stock), pas la
 * logique de sélection (budget JavaScript).
 */
export type VariantView = {
  sku: string;
  /** `?couleur=bordeaux&stockage=512` */
  search: string;
  /** « iPhone 18 Pro (Bordeaux · 512 Go) » : nom annoncé à l'ajout. */
  name: string;
  price_fcfa: number;
  stock: number;
  /** « Bordeaux : en stock. » ou l'explication d'une combinaison épuisée. */
  status: string;
  groups: VariantGroup[];
};

export const SOLD_OUT_STATUS =
  "Cette version est épuisée : choisissez un autre coloris, une autre capacité ou une autre taille.";

export function variantViews<T extends PickerVariant>(
  productName: string,
  variants: readonly T[],
): VariantView[] {
  return variants.map((variant) => ({
    sku: variant.sku,
    search: variantSearch(variant),
    name: lineName({ name: productName, variant_label: variant.color_name }),
    price_fcfa: variant.price_fcfa,
    stock: variant.stock,
    status: variant.stock > 0 ? `${colorLabel(variant)} : en stock.` : SOLD_OUT_STATUS,
    groups: variantGroups(variants, variant),
  }));
}
