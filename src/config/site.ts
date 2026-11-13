/**
 * Configuration du site : identité et routes.
 *
 * Principe 3 du plan : un lien n'apparaît que si sa page existe.
 * La navigation, l'en-tête et le pied de page passent par `routeFor()`,
 * qui renvoie `null` pour une route prévue mais pas encore livrée.
 */

export const site = {
  name: "VERSUS",
  tagline: "Apple, Samsung et Xiaomi réunis dans une seule boutique.",
  description:
    "VERSUS, boutique fictive de smartphones, écouteurs et montres Apple, Samsung et Xiaomi pour le Togo. Projet pédagogique : aucune vente réelle, prix indicatifs en FCFA.",
  locale: "fr_FR",
  notice: {
    lead: "Projet pédagogique",
    rest: "Site fictif, aucune vente réelle · Prix indicatifs en FCFA",
  },
} as const;

/** Toutes les routes prévues par le plan (§3.2), livrées ou non. */
const plannedRoutes = {
  accueil: "/",
  boutique: "/boutique",
  comparer: "/comparer",
  aideAuChoix: "/aide-au-choix",
  recherche: "/recherche",
  panier: "/panier",
  suivi: "/suivi",
  compte: "/compte",
  connexion: "/connexion",
  mentionsLegales: "/mentions-legales",
  credits: "/credits",
  confidentialite: "/confidentialite",
  cgv: "/cgv",
  livraison: "/livraison",
  garantie: "/garantie",
  faq: "/faq",
  contact: "/contact",
  aPropos: "/a-propos",
} as const;

export type RouteKey = keyof typeof plannedRoutes;

/** Routes livrées à ce jour (étape 1). À compléter à chaque étape. */
const deliveredRoutes: ReadonlySet<RouteKey> = new Set<RouteKey>([
  "accueil",
  "mentionsLegales",
  "credits",
]);

/** Chemin de la route si elle est livrée, sinon `null` (le lien doit alors être masqué). */
export function routeFor(key: RouteKey): string | null {
  return deliveredRoutes.has(key) ? plannedRoutes[key] : null;
}

export type NavLink = { label: string; href: string };

/** Ne garde que les liens dont la route est livrée. */
export function deliveredLinks(
  links: ReadonlyArray<{ label: string; route: RouteKey }>,
): NavLink[] {
  return links.flatMap(({ label, route }) => {
    const href = routeFor(route);
    return href ? [{ label, href }] : [];
  });
}

/** Liens d'information (pied de page provisoire de l'étape 1). */
export const infoLinks = deliveredLinks([
  { label: "Mentions légales", route: "mentionsLegales" },
  { label: "Crédits", route: "credits" },
  { label: "Confidentialité", route: "confidentialite" },
  { label: "CGV", route: "cgv" },
]);
