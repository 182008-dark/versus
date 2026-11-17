const formatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** Espace insécable (U+00A0) entre le montant et l'unité, et après « Dès ». */
export const NBSP = " ";

/** Montant et unité séparés, pour les styliser différemment (composant Price). */
export type FCFAParts = { amount: string; unit: "FCFA" };

/**
 * Montant et unité de `formatFCFA()`, séparés : `{ amount: "970 000", unit: "FCFA" }` (espace
 * fine insécable U+202F entre les milliers). `amount + NBSP + unit === formatFCFA(montant)`.
 */
export function formatFCFAParts(amount: number): FCFAParts {
  if (!Number.isFinite(amount)) {
    throw new RangeError(`Montant invalide : ${amount}`);
  }
  return { amount: formatter.format(amount), unit: "FCFA" };
}

/**
 * Seul formateur de montants du projet (§3.4 du plan).
 * Exemple : formatFCFA(849000) === "849 000 FCFA"
 * (espace fine insécable entre les milliers, espace insécable avant « FCFA »).
 */
export function formatFCFA(amount: number): string {
  const parts = formatFCFAParts(amount);
  return `${parts.amount}${NBSP}${parts.unit}`;
}
