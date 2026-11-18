/**
 * Classes de `ProductCard` en disposition `adaptive` (pages marque, §3.2 du plan de refonte),
 * séparées du composant comme `button-styles.ts`. Les seuils suivent `grid-products` : liste sous
 * 400 px, 2 colonnes étroites jusqu'à 640 px, grande carte du produit phare dès 901 px.
 */

/** Sous 400 px en disposition `adaptive` (même seuil que `grid-products`) : liste. */
export const list = {
  card: "max-[400px]:grid max-[400px]:grid-cols-[88px_minmax(0,1fr)] max-[400px]:content-start max-[400px]:gap-x-4",
  right: "max-[400px]:col-start-2",
  visual:
    "max-[400px]:col-start-1 max-[400px]:row-span-5 max-[400px]:row-start-1 max-[400px]:m-0 max-[400px]:h-[88px] max-[400px]:self-center",
  name: "max-[400px]:mt-1",
};

/** Sous 641 px en disposition `adaptive` (liste et grille de 2 colonnes étroites). */
export const compact = {
  card: "max-sm:min-h-0 max-sm:px-3.5 max-sm:py-4",
  visual: "max-sm:mt-2 max-sm:mb-1 max-sm:h-[120px]",
  name: "max-sm:text-[17px]",
  tagline: "max-sm:hidden",
  price: "max-sm:mt-2 max-sm:mb-3",
  button: "max-sm:px-3",
};

/**
 * Produit phare d'une section (`featured`), dès 901 px : la carte occupe 2 colonnes de la grille
 * (classe `md:col-span-2` posée par la page sur l'élément de liste) ; photo à gauche, texte à
 * droite, centré verticalement par deux rangées élastiques.
 */
export const featured = {
  card: "md:grid md:grid-cols-2 md:grid-rows-[1fr_repeat(6,auto)_1fr] md:gap-x-8 md:p-8",
  visual: "md:col-start-1 md:row-span-full md:row-start-1 md:m-0 md:h-[300px] md:self-center",
  header: "md:col-start-2 md:row-start-2",
  name: "md:col-start-2 md:row-start-3 md:mt-3 md:text-[28px]",
  meta: "md:col-start-2 md:row-start-4",
  tagline: "md:col-start-2 md:row-start-5 md:mt-2",
  price: "md:col-start-2 md:row-start-6",
  button: "md:col-start-2 md:row-start-7 md:w-auto md:justify-self-start",
};
