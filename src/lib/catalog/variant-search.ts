/** Paramètres d'adresse d'une variante sur la fiche (§3.2). */
const KEYS = ["couleur", "stockage", "taille"] as const;

/**
 * Variante désignée par l'adresse (`?couleur=argent&stockage=256`), parmi des variantes décrites
 * par leur propre adresse (`variantSearch`) ; `undefined` si l'adresse ne choisit rien de connu.
 * Un paramètre absent ne contraint rien (`?taille=44` suffit pour une montre). Module minimal :
 * il part dans le JavaScript de la fiche.
 */
export function matchSearch<T extends { search: string }>(
  variants: readonly T[],
  search: string,
): T | undefined {
  const params = new URLSearchParams(search);
  const keys = KEYS.filter((key) => params.has(key));
  if (keys.length === 0) return undefined;
  return variants.find((variant) => {
    const own = new URLSearchParams(variant.search);
    return keys.every((key) => own.get(key) === params.get(key));
  });
}
