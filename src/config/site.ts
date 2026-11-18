/**
 * Configuration du site : identité, routes, navigation, en-tête et pied de page.
 *
 * Principe 3 du plan : un lien n'apparaît que si sa page existe.
 * La navigation, l'en-tête et le pied de page passent par `routeFor()`, qui renvoie `null`
 * pour une route prévue mais pas encore livrée : le lien est alors retiré du DOM.
 */

import type { Brand } from "@/lib/brand-themes";
import { notice } from "./notice";

export const site = {
  name: "VERSUS",
  tagline: "Apple, Samsung et Xiaomi réunis dans une seule boutique.",
  description:
    "VERSUS, boutique fictive de smartphones, écouteurs et montres Apple, Samsung et Xiaomi pour le Togo. Projet pédagogique : aucune vente réelle, prix indicatifs en FCFA.",
  locale: "fr_FR",
  notice,
  /** Année écrite en dur : lire la date pendant le rendu empêcherait le prérendu statique. */
  copyrightYear: 2026,
  legal:
    "Projet pédagogique, non commercial · Aucune vente réelle. Apple, Samsung et Xiaomi sont des marques de leurs propriétaires respectifs ; les visuels officiels appartiennent à leurs marques. Prix indicatifs en FCFA.",
  /** Moyens de paiement présentés (tous simulés, aucun encaissement). */
  payments: ["T-Money", "Flooz", "Carte bancaire", "À la livraison"],
} as const;

/** Toutes les routes prévues par le plan (§3.2), livrées ou non. */
const plannedRoutes = {
  accueil: "/",
  boutique: "/boutique",
  produit: "/produit",
  marqueApple: "/marques/apple",
  marqueSamsung: "/marques/samsung",
  marqueXiaomi: "/marques/xiaomi",
  smartphones: "/boutique#smartphones",
  ecouteurs: "/boutique#ecouteurs",
  montres: "/boutique#montres",
  bracelets: "/boutique#bracelets",
  comparer: "/comparer",
  /** Section « comparer » de l'accueil : cible de « Comparer » tant que /comparer n'existe pas. */
  comparerAccueil: "/#comparer",
  aideAuChoix: "/aide-au-choix",
  /** Section « aide au choix » de l'accueil (QuizTeaser), affichée avec /aide-au-choix (étape 5). */
  aideAccueil: "/#aide",
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

/** Routes livrées à ce jour (étape 3, puis lot 3 de la refonte). À compléter à chaque étape. */
const deliveredRoutes: ReadonlySet<RouteKey> = new Set<RouteKey>([
  "accueil",
  "boutique",
  "produit",
  "marqueApple",
  "marqueSamsung",
  "marqueXiaomi",
  "smartphones",
  "ecouteurs",
  "montres",
  "bracelets",
  "comparerAccueil",
  "mentionsLegales",
  "credits",
  "confidentialite",
  "cgv",
  "livraison",
  "garantie",
]);

/** Chemin de la route si elle est livrée, sinon `null` (le lien doit alors être masqué). */
export function routeFor(key: RouteKey): string | null {
  return deliveredRoutes.has(key) ? plannedRoutes[key] : null;
}

/** Toutes les clés de route prévues, livrées ou non. */
export const routeKeys = Object.keys(plannedRoutes) as RouteKey[];

/**
 * Chemin prévu d'une route, même non livrée : réservé aux tests, qui vérifient qu'aucun lien ni
 * formulaire ne vise une route non livrée. Ne jamais en faire un lien (utiliser `routeFor`).
 */
export function plannedPathFor(key: RouteKey): string {
  return plannedRoutes[key];
}

/** URL d'une fiche produit dont la route dynamique est livrée. */
export function productHref(slug: string): string {
  const route = routeFor("produit");
  if (!route) throw new Error("La route des fiches produit n'est pas livrée.");
  return `${route}/${encodeURIComponent(slug)}`;
}

/** Clé de route de la page de chaque marque (`/marques/<slug>`). */
const brandRouteKeys = {
  apple: "marqueApple",
  samsung: "marqueSamsung",
  xiaomi: "marqueXiaomi",
} as const satisfies Record<Brand, RouteKey>;

/**
 * Page d'une marque (`/marques/apple`…) si elle est livrée, sinon `null`. Seule source des liens
 * de marque : en-tête, menu mobile, pied de page, cartes de l'accueil, fiche, boutique.
 */
export function brandHref(brand: Brand): string | null {
  return routeFor(brandRouteKeys[brand]);
}

export type LinkSpec = { label: string; route: RouteKey };
export type NavLink = { label: string; href: string };
export type NavGroup = { label: string; links: NavLink[] };
type GroupSpec = { label: string; links: ReadonlyArray<LinkSpec> };

/** Ne garde que les liens dont la route est livrée. */
export function deliveredLinks(links: ReadonlyArray<LinkSpec>): NavLink[] {
  return links.flatMap(({ label, route }) => {
    const href = routeFor(route);
    return href ? [{ label, href }] : [];
  });
}

/** Ne garde que les liens livrés, et retire les groupes devenus vides. */
export function deliveredGroups(groups: ReadonlyArray<GroupSpec>): NavGroup[] {
  return groups.flatMap(({ label, links }) => {
    const delivered = deliveredLinks(links);
    return delivered.length > 0 ? [{ label, links: delivered }] : [];
  });
}

/** Chaque marque mène à sa page (refonte, lot 3 ; règle 3 de la direction). */
const brandLinks = [
  { label: "Apple", route: brandRouteKeys.apple },
  { label: "Samsung", route: brandRouteKeys.samsung },
  { label: "Xiaomi", route: brandRouteKeys.xiaomi },
] as const satisfies ReadonlyArray<LinkSpec>;

const helpLinks = [
  { label: "Livraison et retours", route: "livraison" },
  { label: "Garantie", route: "garantie" },
  { label: "FAQ", route: "faq" },
  { label: "Contact", route: "contact" },
] as const satisfies ReadonlyArray<LinkSpec>;

/** Navigation principale : marques vers leur page, catégories vers les ancres de la boutique. */
const mainNavSpec: ReadonlyArray<GroupSpec> = [
  { label: "Marques", links: brandLinks },
  {
    label: "Catégories",
    links: [
      { label: "Smartphones", route: "smartphones" },
      { label: "Écouteurs", route: "ecouteurs" },
      { label: "Montres", route: "montres" },
      { label: "Bracelets", route: "bracelets" },
    ],
  },
  {
    label: "Outils",
    links: [
      { label: "Comparer", route: "comparer" },
      { label: "Aide au choix", route: "aideAuChoix" },
    ],
  },
];

export const mainNav: NavGroup[] = deliveredGroups(mainNavSpec);

/**
 * Libellés de toute la navigation prévue, livrée ou non, pour l'aperçu NON CLIQUABLE du
 * styleguide (comparaison avec la maquette). Ne jamais en faire des liens.
 */
export const mainNavPreview: ReadonlyArray<{ label: string; items: string[] }> = mainNavSpec.map(
  (group) => ({ label: group.label, items: group.links.map((link) => link.label) }),
);

/** Menu mobile (≤ 900 px) : la navigation principale, puis l'aide. */
export const mobileNav: NavGroup[] = deliveredGroups([
  ...mainNavSpec,
  { label: "Aide", links: helpLinks },
]);

export type HeaderActionKey = "search" | "compare" | "account" | "cart";
export type HeaderAction = { key: HeaderActionKey; label: string; href: string };

/** Icônes de l'en-tête : chacune reste masquée tant que sa route n'est pas livrée. */
export const headerActions: HeaderAction[] = (
  [
    { key: "search", label: "Rechercher", route: "recherche" },
    { key: "compare", label: "Comparateur", route: "comparer" },
    { key: "account", label: "Mon compte", route: "compte" },
    { key: "cart", label: "Panier", route: "panier" },
  ] as const
).flatMap(({ key, label, route }) => {
  const href = routeFor(route);
  return href ? [{ key, label, href }] : [];
});

/**
 * Colonnes du pied de page (maquette : Boutique, Aide, VERSUS). Colonne « Boutique » : quatre
 * adresses distinctes (tout le catalogue, puis une page par marque).
 */
export const footerColumns: NavGroup[] = deliveredGroups([
  {
    label: "Boutique",
    links: [{ label: "Tout le catalogue", route: "boutique" }, ...brandLinks],
  },
  { label: "Aide", links: helpLinks },
  {
    label: "VERSUS",
    links: [
      { label: "À propos", route: "aPropos" },
      { label: "Comparateur", route: "comparer" },
      { label: "Aide au choix", route: "aideAuChoix" },
      { label: "Mentions légales", route: "mentionsLegales" },
    ],
  },
]);

/**
 * Adresses de la navigation principale. Le pied de page ne marque pas ces liens comme « page
 * courante » : l'en-tête (ou le menu mobile) le fait déjà, et une page n'en expose qu'un.
 */
export const mainNavHrefs: ReadonlySet<string> = new Set(
  mainNav.flatMap((group) => group.links.map((link) => link.href)),
);

/** Liens légaux du bas de page (ajout à la maquette, voir docs/ecarts-maquette.md). */
export const legalLinks: NavLink[] = deliveredLinks([
  { label: "Confidentialité", route: "confidentialite" },
  { label: "CGV", route: "cgv" },
  { label: "Crédits", route: "credits" },
]);
