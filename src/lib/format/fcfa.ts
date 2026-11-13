const formatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/**
 * Seul formateur de montants du projet (§3.4 du plan).
 * Exemple : formatFCFA(849000) === "849 000 FCFA"
 * (espace fine insécable entre les milliers, espace insécable avant « FCFA »).
 */
export function formatFCFA(amount: number): string {
  if (!Number.isFinite(amount)) {
    throw new RangeError(`Montant invalide : ${amount}`);
  }
  return `${formatter.format(amount)} FCFA`;
}
