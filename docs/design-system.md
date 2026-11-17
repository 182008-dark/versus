# Design system VERSUS

Référence : `docs/PLAN.md` §4, ADR [002](decisions/002-design-system.md). Vitrine vivante :
`/styleguide` (local, preview et `next start` ; 404 en production).

## 1. Tokens

Fichier unique : `src/app/globals.css`, en trois couches. Depuis la refonte (lot 2, direction
« évolution raffinée », `docs/plans/refonte.md` §4 et avenant à l'ADR 002) : gris « pierre »
légèrement verdis, une seule couleur d'action (le vert VERSUS), trois arrondis, plus de petites
capitales espacées.

### Primitives

| Famille       | Tokens                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| Neutres       | `--white`, `--black`, `--gray-950` (encre `#1A1D1B`) à `--gray-25` ; `--gray-450` (contour de contrôle) |
| Nuit          | `--night-950`, `--night-900` (`#0B0D0C`, fond du quiz), `--night-800` (`#141715`), `--night-700`        |
| Accent VERSUS | `--green-700`, `--green-600`, `--green-300`, `--green-50` (décision D1, inchangés)                      |
| États         | `--red-700` (erreur), `--amber-800` (avertissement)                                                     |

Gris avant → après : 950 `#1D1D1F` → `#1A1D1B`, 700 `#424245` → `#3F4542`, 600 `#6D6D72` →
`#5C635F`, 500 `#86868B` → `#7D847F` (décoratif ou texte ≥ 24 px seulement : 3,83:1), 450 nouveau
`#8A9089`, 400 `#A1A1A6` → `#A8ADA9`, 300 `#D2D2D7` → `#D5D9D6`, 200 `#EDEDF0` → `#E6E9E7`, 100
`#EAEAEE` → `#EEF0EE`, 50 `#F5F5F7` → `#F4F5F3`, 25 `#FBFBFD` → `#FAFBFA`.

### Rôles sémantiques (les seuls utilisés par les composants)

| Rôle                                                      | Primitive                                         | Classe Tailwind                            |
| --------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| `--bg`, `--ink`, `--ink-strong`                           | white, gray-950, black                            | `bg-bg`, `text-ink`, `text-ink-strong`     |
| `--surface`, `--surface-2`, `--surface-hover`             | gray-50, gray-25, gray-100                        | `bg-surface`…                              |
| `--surface-dark`, `--surface-dark-2`                      | night-900, night-800                              | `bg-surface-dark`…                         |
| `--line`, `--line-soft`, `--line-strong`                  | gray-300, gray-200, noir 20 %                     | `border-line`…                             |
| `--line-control` (nouveau)                                | gray-450                                          | `border-line-control` (pastilles, boutons) |
| `--muted`, `--muted-strong`                               | gray-600, gray-700                                | `text-muted`…                              |
| `--muted-on-dark`, `--eyebrow-on-dark`                    | gray-400, gray-500                                | `text-muted-on-dark`…                      |
| `--accent`, `--accent-hover`                              | green-600, green-700                              | `bg-accent`, `state-hover:bg-accent-hover` |
| `--accent-ink` (nouveau)                                  | green-700 (`#006B4B`)                             | `text-accent-ink` : vert sur gris clair    |
| `--accent-on-dark`, `--accent-soft`                       | green-300, green-50                               | `text-accent-on-dark`, `bg-accent-soft`    |
| `--badge-new-ink` (nouveau)                               | green-700                                         | `text-badge-new-ink` (badge « Nouveau »)   |
| `--price` (nouveau)                                       | black (`--ink-strong`)                            | `text-price`                               |
| `--on-accent`, `--on-dark`                                | white                                             | `text-on-accent`, `text-on-dark`           |
| `--danger`, `--warning`                                   | red-700, amber-800                                | `text-danger`, `text-warning`              |
| `--scrim`, `--outline-image` (nouveaux)                   | noir 4 %, noir 6 %                                | voile au survol, contour des zones photo   |
| `--focus-ring`                                            | accent (accent-on-dark sous `[data-tone="dark"]`) | — (règle globale)                          |
| `--notice-bg`, `--notice-ink`                             | gray-950, gray-300                                | bandeau « Projet pédagogique »             |
| `--header-bg`, `--header-bg-translucent`, `--header-line` | blanc, blanc 78 %, noir 7 %                       | en-tête                                    |

La palette par défaut de Tailwind est retirée (`--color-*: initial`) : `bg-blue-500` n'existe pas.
Les primitives n'ont pas de classe non plus (ni `text-white`, ni `bg-black`) : le pont
`@theme inline` ne renvoie qu'à des rôles, ce que vérifie `design-tokens.test.ts`.

**Ajouter un token** : le déclarer dans le premier `:root` de `globals.css` **et** dans
`src/data/design-tokens.ts` (`primitives` pour une valeur littérale, `semantic` pour un rôle,
`translucent` pour une couleur translucide, `responsiveScales` ou `durations` pour une valeur non
colorée, avec chacun de ses paliers `@media`). Le test de parité échoue dans les deux sens.

### Thèmes de marque

`[data-brand="apple|samsung|xiaomi"]` définit `--brand-ground` (fond pastel), `--brand-ink` (texte)
et `--brand-mark` (pastille et filet de 3 px, **décoratif**, toujours accompagné du nom) : classes
`bg-brand-ground`, `text-brand-ink`, `bg-brand-mark`, `border-brand-mark`. Une couleur de marque
ne sert jamais à une action ni à un aplat saturé : `--brand-acc`, `--brand-on-acc` et la variante de
bouton `brand` sont retirés.

| Marque  | `--brand-ground`      | `--brand-ink`         | `--brand-mark` |
| ------- | --------------------- | --------------------- | -------------- |
| Apple   | `#F5F5F7` → `#F1F2F0` | `#1D1D1F` → `#1A1D1B` | `#1A1D1B`      |
| Samsung | `#EEF1FB`             | `#1428A0`             | `#1428A0`      |
| Xiaomi  | `#FFF1E6` → `#FFF4EC` | `#A84300` → `#9A3D00` | `#FF6900`      |

Les mêmes valeurs sont dans `src/lib/brand-themes.ts` (parité testée), avec les dégradés du hero
(`heroStyle(brand)`), les tuiles et cartes de marque de l'accueil (refaites au lot 4) et les
couleurs du SVG de secours.

### Contrastes

Calculés par `src/lib/color/contrast.ts` et affichés dans `/styleguide` (sections « Couleurs » et
« Marques »). **Toutes** les paires texte / fond employées sont listées dans `contrastPairs`
(`design-tokens.ts`) et verrouillées en AA par `design-tokens.test.ts` ; un test vérifie que chaque
classe `text-<rôle>` de `src/` a sa paire. Les thèmes de marque sont vérifiés par
`brand-themes.test.ts`. Extrait (ratios tronqués) :

| Paire                                       | Ratio            | Niveau            |
| ------------------------------------------- | ---------------- | ----------------- |
| `--accent` sur blanc / blanc sur `--accent` | 4,95:1           | AA                |
| `--accent-ink` sur `--surface`              | 5,99:1           | AA                |
| `--accent-ink` sur `--surface-hover`        | 5,72:1           | AA                |
| `--badge-new-ink` sur `--accent-soft`       | 5,78:1           | AA                |
| `--muted` sur blanc / sur `--surface`       | 6,16:1 / 5,63:1  | AA                |
| `--accent-on-dark` sur `--surface-dark`     | 11,03:1          | AAA               |
| `--line-control` sur blanc (contour)        | 3,26:1           | ≥ 3:1 non textuel |
| encre Samsung / Xiaomi sur leur fond pastel | 10,10:1 / 6,37:1 | AAA / AA          |

Règles :

- **Texte ou lien vert sur un gris clair : `--accent-ink`** (`TextLink tone="accentInk"`). Le vert
  VERSUS n'y fait que 4,53:1 sur `--surface` et 4,32:1 sur `--surface-hover`.
- `--line-control` se pose sur un fond blanc (3,26:1) ou `--surface-2` (3,14:1), pas directement
  sur `--surface` (2,98:1) : une pastille posée sur la surface grise garde un fond blanc.
- `--gray-500` reste décoratif (3,83:1 sur blanc). La pastille orange de Xiaomi (2,88:1) est
  décorative : le nom l'accompagne toujours.
- `--muted` est de nouveau permis sur les fonds de marque (5,46:1 au moins).

### Typographie

Polices inchangées : Plus Jakarta Sans (titres, prix), Inter (texte), servies par `next/font`.
Titres équilibrés (`text-wrap: balance`) et sans point final ; plus de petites capitales espacées.

| Usage            | Classe / variable                    | ≤ 640 px | ≥ 641 px | ≥ 1025 px | Graisse, approche     |
| ---------------- | ------------------------------------ | -------- | -------- | --------- | --------------------- |
| Titre du hero    | `text-display-hero`                  | 44       | 64       | 76        | 800, −0,03 em         |
| Nom de marque    | `text-display-brand` (nouveau)       | 48       | 72       | 88        | 800, −0,03 em         |
| Titre de tuile   | `text-display-tile`                  | 36       | 48       | 56        | 700, −0,025 em        |
| Titre de section | `text-display-h2`                    | 32       | 44       | 48        | 700, −0,025 em        |
| Nom sur carte    | `text-card-name` (nouveau, 2 lignes) | 16       | 18       | 18        | 700, −0,01 em         |
| Prix sur carte   | `<Price size="card">`                | 17       | 20       | 20        | 700, chiffres alignés |
| Prix du hero     | `<Price size="lead">`                | 22       | 28       | 28        | 700, chiffres alignés |
| Question du quiz | `var(--text-quiz)`                   | 24       | 30       | 30        | 700                   |
| Accroche         | `var(--text-sub)`                    | 17       | 19       | 19        | 400                   |
| Méta             | `text-meta` (nouveau) ; `eyebrow`    | 13       | 13       | 13        | Inter 600             |

« Dès » et « FCFA » : 0,7 × le montant, Inter 600, `--muted-strong`. L'utilitaire `eyebrow` est un
alias temporaire en casse normale (le surtitre devient la pastille de marque aux lots 3 à 5).

### Arrondis, ombres, mouvement, espacements, grille

- **Arrondis** (déclarés dans `@theme`) : `rounded-tile` 28 px (tuiles, bandeau et cartes de
  marque), `rounded-card` 20 px (cartes produit, encarts, comparateur), `rounded-control` 12 px
  (zone photo, champs, menus), `rounded-full` (boutons, pastilles, badges, VS). Emboîtement : zone
  photo 12 px + marge 8 px = carte 20 px. **Alias temporaires** : `box` → tile, `result` → card,
  `option`, `icon`, `chip` → control (même valeur, testée), à retirer quand plus rien ne les emploie.
- **Ombres** : `shadow-card` = `0 1px 2px rgb(0 0 0/.04), 0 12px 32px -16px rgb(0 0 0/.18)` ;
  `shadow-tray` inchangée.
- **Mouvement** : `--dur-fast` 150 ms (clic, sortie), `--dur-base` 220 ms (survol), `--dur-slow`
  400 ms (diapositive), en classes `duration-(--dur-base)`. Courbe unique `ease-out` ;
  `--ease-bounce` est retirée.
- **Espacements** : `--space-section` 64 px, 96 px dès 901 px (utilitaire `section`, classes
  `py-section`, `pb-section`), seul espacement entre sections (`.brand-section` supprimée) ;
  `--gutter` 16 px, 24 px dès 641 px (marge de `wrap`, classes `px-gutter`, `-mx-gutter`).
- **Grille** : `wrap` (1288 px au plus) ; `grid-page` 4 / 6 / 12 colonnes (641, 901 px),
  gouttière 16 puis 24 px dès 1240 px ; `grid-products` en liste sous 400 px, 2 colonnes dès
  400 px, 3 dès 901 px, 4 dès 1240 px, rangées de hauteur égale.
- Utilitaires : `wrap`, `section`, `grid-page`, `grid-products`, `eyebrow`, `text-meta`,
  `text-card-name`, `prose-info` (pages d'information).

## 2. Points de rupture : maquette → mobile d'abord

La maquette est écrite en `max-width` (bureau d'abord). VERSUS est écrit en `min-width` (mobile
d'abord) avec des seuils équivalents : `max-width: 640px` ⇔ « en dessous de `sm` ».

| Maquette (`max-width`) | VERSUS                         | Ce qui change                                                               |
| ---------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| ≤ 640 px               | base (< 641 px)                | typographie mobile, sections 64 px, gouttière 16 px, pied de page 1 colonne |
| ≤ 900 px               | base et `sm` (< 901 px)        | navigation masquée, **menu mobile** ; en-tête opaque                        |
| ≤ 1024 px              | `md` (901–1024 px)             | sections 96 px, pied de page 2 colonnes, hero 64 px                         |
| > 1024 px              | `lg` (≥ 1025 px), `xl` 1240 px | pied de page 1,6 fr + 3 colonnes, hero 76 px                                |

Points de rupture déclarés dans `@theme` : `sm` 641, `md` 901, `lg` 1025, `xl` 1240. Le seuil de
400 px des grilles de produits (liste en dessous) est écrit dans l'utilitaire `grid-products`.

## 3. États et mouvement

- `state-hover:`, `state-focus:`, `state-active:` : vrai état **ou** `data-state="…"` (styleguide).
  Le vrai survol de `state-hover:` ne s'applique que sous `@media (hover: hover)` (comme `hover:`
  dans Tailwind v4) : pas de survol collé après un appui sur écran tactile. Même règle pour les
  liens de `prose-info`. Ne pas écrire `hover:` directement : utiliser `state-hover:`.
- Anneau de focus global : `:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px }`.
- `src/styles/animations.css` : keyframes `up`, `fade`, `art-in`, `float`, `glow`, `spin`, `fill`,
  `bump`, `tray-in`, `q-in`, `zoom`, `rise` ; classes `anim-*` et `.reveal/.zoom/.rise` sous
  `prefers-reduced-motion: no-preference` ; état par défaut toujours visible ; sous mouvement
  réduit, aucune animation ni transition.
- Pas d'agrandissement au survol (boutons) : léger enfoncement `scale(.97)` à l'appui, sous
  `motion-safe` ; transitions en `--dur-base` (survol) et `--dur-fast` (appui).

## 4. Composants

### `src/components/ui/`

| Composant           | S/C | Props principales                                                                        | Notes                                                                                                                                                                                                                                                                                                    |
| ------------------- | --- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`            | S   | `variant` (primary, secondary, onDark), `size` (md 44, lg 48), `href?`, `pressed?`       | `primary` toujours vert, y compris sur fond sombre ; `href` → `<Link>` ; sinon `type="button"` ; `aria-pressed` ; `scale(.97)` à l'appui sous `motion-safe` ; alias temporaires `dark`, `light`, `brand` → primary et `outline` → secondary (`LEGACY_BUTTON_VARIANTS`) ; classes dans `button-styles.ts` |
| `TextLink`          | S   | `href`, `tone` (accent, accentInk, ink, light, accentOnDark), `arrow?`                   | 44 px de haut ; flèche décalée au survol et au focus                                                                                                                                                                                                                                                     |
| `Arrow`             | S   | —                                                                                        | « → », `aria-hidden`                                                                                                                                                                                                                                                                                     |
| `IconButton`        | S/C | `label`, `icon`, `count?`, `countUnits?`, `href?`                                        | nom « Panier, 3 articles » (`countLabel`), `aria-live`                                                                                                                                                                                                                                                   |
| `CountBadge`        | S   | `value`                                                                                  | pastille accent ; `bump` rejoué par `key`                                                                                                                                                                                                                                                                |
| `Icon`              | S   | `name` (search, compare, account, cart, menu, close)                                     | tracés de la maquette, `aria-hidden`                                                                                                                                                                                                                                                                     |
| `Badge`, `NewBadge` | S   | `tone` (new, neutral, muted, brand, onDark ; `accent` = alias de new)                    | capsule de 24 px en casse normale ; « Nouveau » `--badge-new-ink` sur `--accent-soft` (5,78:1) ; « Épuisé » en `muted` (gris neutre)                                                                                                                                                                     |
| `Price`             | S   | `amount` (montant ou prix des variantes), `from?`, `size` (card, lead, inline)           | « Dès 970 000 FCFA » : « Dès » seulement s'il y a plusieurs prix ; chiffres alignés ; espaces insécables et `nowrap` ; « Dès » / « FCFA » à 0,7 × en Inter 600 (`formatFCFAParts`)                                                                                                                       |
| `BrandMark`         | S   | `brand`, `size` (meta, lead), `tone` (light, onDark), `href?`                            | pastille de 8 px (`--brand-mark`, décorative) + nom en casse normale à l'encre de la marque ; pose son `data-brand` ; lien de 44 px avec `href`                                                                                                                                                          |
| `VsMark`            | S   | `size` (md 44 px, sm 32 px)                                                              | médaillon « VS » à l'encre VERSUS, anneau blanc de 3 px ; `aria-hidden`, jamais focalisable                                                                                                                                                                                                              |
| `Eyebrow`           | S   | `as`, `tone`                                                                             | alias temporaire : casse normale, pastille accent de 8 px ; remplacé par `BrandMark` aux lots 3 à 5                                                                                                                                                                                                      |
| `Dialog`            | C   | `open`, `onClose`, `labelledBy`/`label`, `variant` (modal, fullscreen), `returnFocusRef` | `<dialog>` natif, Échap, focus piégé (`lib/a11y/focus-trap.ts`), focus rendu ; `onClose` une fois par demande de l'utilisateur ; fermée si `<Activity>` masque la page                                                                                                                                   |
| `VisuallyHidden`    | S   | —                                                                                        | `sr-only`                                                                                                                                                                                                                                                                                                |
| `SkipLink`          | S   | `targetId`                                                                               | hors écran tant qu'il n'a pas le focus (pas `sr-only`) ; capsule claire de 44 px, au-dessus de l'en-tête collant                                                                                                                                                                                         |
| `ScrollRegion`      | S   | `label`, `className`                                                                     | conteneur à défilement horizontal : `role="region"`, nom, `tabIndex={0}` (défilement au clavier)                                                                                                                                                                                                         |

### `src/components/layout/`

| Composant         | S/C | Rôle                                                                                                                                                                  |
| ----------------- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AnnouncementBar` | S   | bandeau « Projet pédagogique » (ancien `FictiveNotice`), région « Avertissement »                                                                                     |
| `Logo`            | S   | monogramme « V/S » et nom ; lien « VERSUS, accueil » ; zone cliquable de 44 px de haut (pseudo-élément, sans changer la mise en page) ; `onClick` pour le menu mobile |
| `SiteHeader`      | S   | `banner` collant de 56 px ; translucide ≥ 901 px, opaque en dessous                                                                                                   |
| `MainNav`         | S   | groupes de `mainNav` séparés par un filet ; `preview` pour le styleguide                                                                                              |
| `NavLink`         | C   | `aria-current="page"` (`usePathname`)                                                                                                                                 |
| `MobileMenu`      | C   | bouton `aria-expanded` + `Dialog` plein écran (≤ 900 px) ; se ferme au clic sur un lien ou le logo, au changement de chemin et quand `<Activity>` masque la page      |
| `SiteFooter`      | S   | `contentinfo` : colonnes, moyens de paiement, liens légaux, mentions du bas ; liens `NavLink` (`aria-current`, page courante soulignée) de 44 px sous 641 px          |
| `PaymentBadges`   | S   | T-Money, Flooz, Carte bancaire, À la livraison (simulés)                                                                                                              |
| `InfoPage`        | S   | gabarit des pages d'information                                                                                                                                       |
| `ErrorState`      | S   | contenu des pages 404 et d'erreur                                                                                                                                     |

Îlots client ajoutés à l'étape 2 : `MobileMenu` (prévu au §3.4), `Dialog` (utilisé par lui),
`NavLink` (seul `usePathname` l'exige).

### Formats français (`src/lib/format/`)

`formatFCFA()` (seul formateur de montants), `formatFCFAParts()` (montant et unité séparés pour
`Price`), `formatSpec()` (« 6,3″ », « 6,9 mm », « 5 000 mAh » : virgule, espaces insécables) et
`categoryLabel()` (« Écouteurs », jamais le slug).

### Primitives livrées à l'étape 3

`Pill`, `PillGroup`, `Price`, `SectionHeader` et `Reveal` sont livrés avec leur premier usage à
l'étape 3. Leurs exemples figurent dans `/styleguide#catalogue`.

### Primitives à venir

Reportées à l'étape de leur premier usage (ADR 002, décision 9) : `Skeleton`, `Select`, `Checkbox`,
`EmptyState` (étape 4) ; `Drawer`, `Toaster`, `Spinner` (étape 5) ; `Field`, `RadioCard`, `Stepper`
(étape 6). Chacune arrive avec sa section dans `/styleguide` et ses tests.

### Pilotage par `src/config/site.ts`

`mainNav`, `mobileNav`, `headerActions`, `footerColumns`, `legalLinks` ne contiennent que des
routes livrées (`routeFor()`). À l'étape 2 : aucune icône ni lien de navigation principale dans
l'en-tête, menu mobile limité à l'aide (livraison, garantie), pied de page Aide + VERSUS.
