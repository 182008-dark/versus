/**
 * Nom accessible d'une icône avec compteur : « Panier, 3 articles », « Comparateur, 1 produit ».
 * Sans compteur (ou à zéro), le libellé seul : « Panier ».
 */
export function countLabel(
  label: string,
  count: number | undefined,
  [singular, plural]: readonly [string, string] = ["article", "articles"],
): string {
  if (count === undefined || count <= 0) return label;
  return `${label}, ${count} ${count > 1 ? plural : singular}`;
}
