/**
 * Libellé du bouton principal du hero (refonte, §3.1) : « Voir l'iPhone 18 Pro », « Voir le
 * Galaxy S26 Ultra ». Article élidé devant une voyelle ou un h (noms de produits sans h aspiré).
 */
export function seeLabel(name: string): string {
  return /^[aeiouyhâéèêîôû]/i.test(name) ? `Voir l'${name}` : `Voir le ${name}`;
}
