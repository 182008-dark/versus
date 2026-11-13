# ADR 002 : design system, tokens Tailwind v4 et accent VERSUS

- **Statut** : accepté
- **Date** : 13 novembre 2026 (étape 2)
- **Référence** : `docs/PLAN.md`, §4 (design system), §7.3 (motifs interdits), étape 2 ;
  décision D1 (§8.1)
- **Nom prévu au §3.4** : `002-tokens-tailwind` ; le fichier s'appelle `002-design-system` car il
  couvre aussi l'accent, les composants de base et la règle du styleguide.

## Contexte

La maquette validée (`Main.dc.html`) écrit ses couleurs en dur dans ses classes et reprend la
palette d'apple.com : bleu d'action `#0071E3`, liens `#0066CC`, bleu clair `#2997FF` sur fond
sombre, orange `#BF4800` pour « Nouveau ». Il faut :

1. reprendre ses valeurs (tokens) sans reprendre son code ;
2. donner à VERSUS une identité propre, distincte des trois marques qu'il vend ;
3. empêcher qu'une couleur soit écrite en dur dans un composant ;
4. garder Tailwind CSS v4, sans `tailwind.config` (configuration en CSS).

## Décisions

### 1. Tokens en trois couches, dans `src/app/globals.css`

| Couche        | Contenu                                               | Qui l'utilise                   |
| ------------- | ----------------------------------------------------- | ------------------------------- |
| Primitives    | `--gray-950`, `--green-600`… (valeurs de la maquette) | uniquement la couche sémantique |
| Sémantique    | `--ink`, `--surface`, `--accent`, `--focus-ring`…     | les composants                  |
| Pont Tailwind | `@theme inline { --color-accent: var(--accent); … }`  | les classes `bg-accent`…        |

- `@theme inline` ne contient que des `var()` : changer un token sémantique suffit, sans
  recompiler de valeur.
- Les points de rupture, qui doivent être littéraux pour générer les media queries, sont dans un
  `@theme` **non** inline (`--breakpoint-sm: 641px`…).
- `--color-*: initial` retire la palette par défaut de Tailwind : `bg-blue-500` n'existe pas, seuls
  les rôles VERSUS sont disponibles. C'est une barrière en plus de `check:forbidden`.
- `src/data/design-tokens.ts` garde une copie des primitives et des rôles pour `/styleguide`
  (nuancier et calcul des contrastes). `design-tokens.test.ts` lit `globals.css` et vérifie la
  parité **dans les deux sens** : chaque entrée de `design-tokens.ts` existe dans le premier
  `:root` avec la même valeur, et chaque token de ce `:root` qui se résout en couleur opaque
  existe dans `design-tokens.ts` (primitive s'il est littéral, rôle s'il pointe vers une
  primitive). Les tokens translucides ou non colorés (`--line-strong`, `--header-bg-translucent`,
  `--header-line`, `--icon-hover`, `--header-height`, `--text-*`) sont exemptés par une liste
  explicite : un nouveau token doit donc être classé. Le test vérifie enfin que chaque
  `--color-*` de `@theme inline` renvoie à un rôle connu, jamais à une primitive.
  `globals.css` reste la source de vérité.

### 2. Accent VERSUS vert (décision D1)

| Token              | Valeur    | Rôle                                           | Contraste mesuré            |
| ------------------ | --------- | ---------------------------------------------- | --------------------------- |
| `--accent`         | `#00805A` | boutons principaux, liens, pastilles, focus    | 4,95:1 avec le blanc (AA)   |
| `--accent-hover`   | `#006B4B` | survol, état actif, texte du badge « Nouveau » | 6,55:1 avec le blanc (AA)   |
| `--accent-on-dark` | `#3DDC97` | liens et anneau de focus sur fond sombre       | 11,13:1 sur `#0B0B0C` (AAA) |
| `--accent-soft`    | `#E6F4EE` | capsule « Nouveau », sélection active          | `#006B4B` dessus : 5,78:1   |

Raisons du choix :

- **C'est la seule teinte distincte des trois marques vendues** : Apple est associé au bleu
  (`#0071E3`), Samsung à son bleu `#1428A0`, Xiaomi à son orange `#FF6900`. Un accent bleu ou
  orange ferait passer VERSUS pour une boutique de l'une d'elles, et se confondrait avec les
  couleurs des cartes et tuiles de marque.
- **Le vert est une couleur d'action usuelle en e-commerce** (validation, ajout au panier,
  paiement), immédiatement comprise comme « continuer ».
- **Le contraste AA est mesuré, pas estimé** : `src/lib/color/contrast.ts` implémente la
  luminance relative et le ratio WCAG 2.2, testés sur des valeurs de référence, et `/styleguide`
  affiche les ratios calculés. Le test `design-tokens.test.ts` échoue si une paire d'usage passe
  sous 4,5:1 (3:1 pour l'anneau de focus).

Conséquences :

- Les bleus Apple `#0071E3`, `#0066CC` et `#2997FF` sont interdits partout, liste blanche comprise
  (`check:forbidden`). L'accent « Apple » des cartes de marque devient le noir de la marque
  (`#1D1D1F`).
- Le badge « Nouveau » orange de la maquette devient une capsule `accent-soft` / `accent-hover`.
- Correspondance avec la maquette : `--primary` et `--link` → `--accent` ;
  `--primary-on-dark` → `--accent-on-dark` ; `--badge-new` → capsule `accent-soft`.
- Alternative écartée : indigo `#5B3DF5` (gardée en réserve si le vert était refusé).

### 3. Signatures VERSUS

Monogramme « V/S » (barre oblique en `--accent-on-dark` sur le carré noir), badge capsule,
anneau de focus de 2 px décalé de 2 px (vert clair sur fond sombre via `[data-tone="dark"]`),
liens fléchés « → » au lieu de « › », surtitres précédés d'un carré accent de 6 px. Chacune est
inscrite au registre `docs/ecarts-maquette.md`.

### 4. Littéraux hexadécimaux : liste blanche

Un hexadécimal de couleur n'est permis que dans `src/app/globals.css`, `src/lib/brand-themes.ts`,
`src/data/**`, `**/*.svg` et `**/opengraph-image.tsx`. Les tests unitaires qui ont besoin d'une
couleur la lisent dans `src/data/design-tokens.ts` ou l'écrivent sans `#` (`parseHex` l'accepte).
`brand-themes.ts` porte les thèmes de marque (repris en CSS par `[data-brand]`, parité testée), les
dégradés du hero (injectés en variables inline) et les couleurs du SVG de secours.

### 5. États forçables et variantes personnalisées

Trois variantes Tailwind (`@custom-variant`) : `state-hover`, `state-focus`, `state-active`. Elles
appliquent le style au vrai `:hover` / `:focus-visible` / `:active` **ou** à
`[data-state~="hover|focus|active"]`. `/styleguide` montre ainsi tous les états des boutons et des
liens sans interaction, avec les mêmes classes que le site. Comme la variante `hover:` de
Tailwind v4, le vrai survol de `state-hover` est placé sous `@media (hover: hover)` : sur un écran
tactile, le style de survol ne reste pas collé après un appui ; l'état forcé
`data-state="hover"` reste actif partout.

### 6. Mouvement

`src/styles/animations.css` : l'état par défaut est toujours visible, toute animation est sous
`prefers-reduced-motion: no-preference`, les apparitions au défilement sont en plus sous
`@supports (animation-timeline: view())`. Les doublons de keyframes de la maquette sont supprimés
(on rejoue une animation en changeant la `key`).

### 7. `/styleguide` : 404 en production seulement

`isStyleguideEnabled(env)` (dans `src/lib/env.ts`, testé) renvoie `false` si
`VERCEL_ENV === "production"`. On ne teste **pas** `NODE_ENV` : il vaut `production` pour tout
build (`next build`, `next start` des tests e2e, previews Vercel). La page est donc visible en
local, sous `next start` et en preview, et prérendue en 404 sur la production.

### 8. Aucune nouvelle dépendance

Tout est fait avec ce qui était installé à l'étape 1 (Tailwind, `clsx`, Testing Library,
`@testing-library/user-event`, Playwright, axe). `<dialog>` natif plutôt qu'une bibliothèque de
modales ; calcul de contraste écrit à la main (30 lignes testées) plutôt qu'un paquet de couleurs.

### 9. Primitives livrées avec leur premier usage (écart au plan)

L'objectif de l'étape 2 (§6) annonce « toutes les primitives » et le §3.1 liste 25 composants
`ui/`. L'étape 2 livre ceux dont le gabarit, le styleguide et les critères de l'étape ont besoin :
`Button`, `TextLink`, `Arrow`, `IconButton`, `CountBadge`, `Icon`, `Badge`, `NewBadge`,
`Eyebrow`, `Dialog`, `VisuallyHidden`, `SkipLink`, et `ScrollRegion` (tableau défilant
atteignable au clavier, ajouté à la relecture). Tous les **tokens** sont livrés (couleurs,
rayons, ombres, courbes, typographie, keyframes et classes `reveal`/`zoom`/`rise`).

Les autres primitives sont **reportées** à l'étape qui en a le premier usage, et rattachées à
ses livrables dans le plan (révision 3) :

| Primitive            | Étape | Premier usage                                                      |
| -------------------- | ----- | ------------------------------------------------------------------ |
| `Pill`, `PillGroup`  | 3     | filtre de la section « Nouveautés » de l'accueil                   |
| `Price`              | 3     | `ProductCard`, fiche minimale (« À partir de », `formatFCFA`)      |
| `SectionHeader`      | 3     | en-têtes des sections de l'accueil (surtitre, titre, lien fléché)  |
| `Reveal`             | 3     | apparitions au défilement de l'accueil (classes déjà dans le CSS)  |
| `Skeleton`           | 4     | `loading.tsx` de la fiche, grille de `/boutique` sous `<Suspense>` |
| `Select`             | 4     | `SortSelect` (tri de `/boutique`)                                  |
| `Checkbox`           | 4     | filtre « en stock » de `/boutique` ; case obligatoire à l'étape 6  |
| `EmptyState`         | 4     | `/recherche` sans résultat, `/boutique` filtrée vide               |
| `Drawer`             | 5     | `CartDrawer` (`<dialog>` natif, sur la base de `Dialog`)           |
| `Toaster`            | 5     | toast du comparateur qui nomme le produit retiré                   |
| `Spinner`            | 5     | `AddToCartButton` et `priceCart` en attente                        |
| `Field`, `RadioCard` | 6     | `CheckoutForm` (coordonnées, zone de livraison, moyen de paiement) |
| `Stepper`            | 6     | `CheckoutForm` en 4 étapes (déjà prévu à l'étape 6)                |

Raisons :

- **Principe 8 du plan** : « seulement à l'étape où elle sert ». Une primitive écrite sans
  consommateur fige une API (props, états, messages d'erreur) qu'on ne peut pas encore valider :
  `Field` et `RadioCard` dépendent de la validation zod partagée de l'étape 6, `Toaster` et
  `Drawer` du `CartProvider` et du réducteur du comparateur de l'étape 5.
- Plusieurs n'ont **aucune référence dans la maquette** (`Drawer`, `Toaster`, `Field`,
  `RadioCard`, `Stepper` : « nouveaux » au §4.3) ; leur forme se décide avec l'écran qui les
  utilise.
- Aucun critère d'acceptation de l'étape 2 n'en dépend.

Règle : chaque primitive reportée est livrée **avec** sa section dans `/styleguide` et ses tests
(unitaires, et axe sur le styleguide), à l'étape indiquée.

## Conséquences

- Un composant ne contient que des classes de rôle (`bg-accent`, `text-muted`) ; changer l'accent
  se fait en une ligne de `globals.css` (et de `design-tokens.ts`, vérifié par test). Les
  primitives `--white` et `--black` n'ont pas de classe Tailwind : on écrit `text-on-dark`,
  `text-on-accent`, `bg-bg` ou `bg-header-bg`.
- La maquette est en `box-sizing: content-box` : `.wrap` y mesure 1240 px de contenu + 2 × 24 px.
  Tailwind est en `border-box` : l'utilitaire `wrap` fait donc 1288 px au total, ce qui redonne
  les mêmes positions (logo à 100 px du bord à 1440 px).
- `--muted` (`#6E6E73`) n'atteint que 4,49:1 sur le fond Samsung `#EEF1FB` : sur un fond de
  marque, le texte secondaire utilise `--brand-ink` (relevé par axe dans `/styleguide`).
