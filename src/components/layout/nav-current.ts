/**
 * « Page courante » d'un lien de navigation (refonte, lot 3, §4.7 du plan de refonte) :
 * - seulement si l'adresse correspond exactement au chemin (`/marques/samsung`) ;
 * - jamais pour une ancre (`/boutique#smartphones`, `#bracelets`) : sur la boutique, les quatre
 *   catégories étaient soulignées en même temps que « Boutique » (faux « vous êtes ici ») ;
 * - `enabled = false` pour un lien qui double une navigation prioritaire (pied de page) : une
 *   page n'expose qu'un seul `aria-current`.
 */
export function isCurrentLink(pathname: string | null, href: string, enabled = true): boolean {
  if (!enabled || pathname === null || href.includes("#")) return false;
  return pathname === href;
}
