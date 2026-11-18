import { MAX_CART_LINES, type CartLine } from "./cart-reducer";

/**
 * Annonce d'un ajout au panier depuis la fiche, dans son propre module : il part dans le
 * JavaScript de chaque fiche (îlot VariantPicker), sans les autres textes du panier.
 */

export type AddStatus = "added" | "max" | "full" | "soldOut";

/**
 * Résultat réel d'un ajout, lu en comparant le panier avant et après (le réducteur renvoie le même
 * tableau quand il refuse) : l'annonce dit ce qui s'est vraiment passé, jamais « ajouté » à tort.
 */
export function addOutcome(
  before: readonly CartLine[],
  after: readonly CartLine[],
  sku: string,
  name: string,
  stock: number,
): { status: AddStatus; message: string } {
  const line = after.find((item) => item.sku === sku);
  if (after !== before && line) {
    return {
      status: "added",
      message:
        line.qty > 1
          ? `${name} ajouté au panier (quantité : ${line.qty}).`
          : `${name} ajouté au panier.`,
    };
  }
  if (stock <= 0) return { status: "soldOut", message: `${name} est épuisé.` };
  if (line) {
    return {
      status: "max",
      message: `Quantité maximale atteinte pour ${name} : ${line.qty} au panier.`,
    };
  }
  return {
    status: "full",
    message: `Panier plein : ${MAX_CART_LINES} articles différents au plus.`,
  };
}
