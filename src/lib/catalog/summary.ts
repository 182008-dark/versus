const brandList = new Intl.ListFormat("fr-FR", { style: "long", type: "conjunction" });

/** « 30 produits », « 1 produit » : nombre calculé, jamais écrit en dur dans une page. */
export function productCount(count: number): string {
  return `${count} ${count > 1 ? "produits" : "produit"}`;
}

/** « Apple, Samsung et Xiaomi » : noms de marques dans l'ordre reçu. */
export function brandNames(brands: readonly { name: string }[]): string {
  return brandList.format(brands.map((brand) => brand.name));
}
