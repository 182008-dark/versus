import { NBSP } from "./fcfa";

/** Unités collées au nombre, sans espace (typographie française : 6,3″, 21°). */
const GLUED_UNITS = new Set(["″", "°"]);

const formatters = new Map<number, Intl.NumberFormat>();

function formatter(maximumFractionDigits: number) {
  let current = formatters.get(maximumFractionDigits);
  if (!current) {
    current = new Intl.NumberFormat("fr-FR", { maximumFractionDigits });
    formatters.set(maximumFractionDigits, current);
  }
  return current;
}

/**
 * Caractéristique au format français : virgule décimale, espace fine insécable entre les milliers,
 * espace insécable avant l'unité (sauf ″ et °, collés au nombre).
 *
 * formatSpec(6.3, "″") === "6,3″" ; formatSpec(6.9, "mm") === "6,9 mm" ;
 * formatSpec(100, "W") === "100 W" ; formatSpec(5000, "mAh") === "5 000 mAh".
 */
export function formatSpec(
  value: number,
  unit: string,
  { maximumFractionDigits = 2 }: { maximumFractionDigits?: number } = {},
): string {
  if (!Number.isFinite(value)) {
    throw new RangeError(`Valeur invalide : ${value}`);
  }
  const number = formatter(maximumFractionDigits).format(value);
  if (!unit) return number;
  return GLUED_UNITS.has(unit) ? `${number}${unit}` : `${number}${NBSP}${unit}`;
}
