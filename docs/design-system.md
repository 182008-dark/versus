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
couleurs du SVG de secours. Les tuiles claires (`apple-light`, `samsung-light`, `xiaomi-light`)
lisent leur fond et leur encre dans `brandThemes` : une même marque n'a qu'un pastel sur l'accueil
(test dans `brand-themes.test.ts`, avec le contraste AA de chaque texte de chaque tuile).

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

Les classes de composants de l'accueil suivent déjà ces rôles (alias du lot 2, avant leur refonte
au lot 4) : `.promo-tile-title` prend `--text-tile` en 700 et −0,025 em, comme `text-display-tile` ;
`.hero-eyebrow`, `.promo-tile-eyebrow`, `.compare-brand` et la marque de `ProductCard` sont en
style « méta » (13 px, 600, casse normale, sans espacement).

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

| Composant           | S/C | Props principales                                                                        | Notes                                                                                                                                                                                                                                                                                                                                                |
| ------------------- | --- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`            | S   | `variant` (primary, secondary, onDark), `size` (md 44, lg 48), `href?`, `pressed?`       | `primary` toujours vert, y compris sur fond sombre ; `href` → `<Link>` ; sinon `type="button"` ; `aria-pressed` ; `scale(.97)` à l'appui sous `motion-safe` ; alias temporaires `dark`, `light`, `brand` → primary et `outline` → secondary (`LEGACY_BUTTON_VARIANTS`) ; classes dans `button-styles.ts`                                             |
| `TextLink`          | S   | `href`, `tone` (accent, accentInk, ink, light, accentOnDark), `arrow?`                   | 44 px de haut ; flèche décalée au survol et au focus                                                                                                                                                                                                                                                                                                 |
| `Arrow`             | S   | —                                                                                        | « → », `aria-hidden`                                                                                                                                                                                                                                                                                                                                 |
| `IconButton`        | S/C | `label`, `icon`, `count?`, `countUnits?`, `href?`                                        | nom « Panier, 3 articles » (`countLabel`), `aria-live`                                                                                                                                                                                                                                                                                               |
| `CountBadge`        | S   | `value`                                                                                  | pastille accent ; `bump` rejoué par `key`                                                                                                                                                                                                                                                                                                            |
| `Icon`              | S   | `name` (search, compare, account, cart, menu, close)                                     | tracés de la maquette, `aria-hidden`                                                                                                                                                                                                                                                                                                                 |
| `Badge`, `NewBadge` | S   | `tone` (new, neutral, muted, brand, onDark ; `accent` = alias de new)                    | capsule de 24 px en casse normale ; « Nouveau » `--badge-new-ink` sur `--accent-soft` (5,78:1) ; « Épuisé » en `muted` (gris neutre)                                                                                                                                                                                                                 |
| `Price`             | S   | `amount` (montant ou prix des variantes), `from?`, `size` (card, lead, inline)           | « Dès 970 000 FCFA » : « Dès » seulement s'il y a plusieurs prix (la carte passe `[min_price_fcfa, max_price_fcfa]`, la fiche les prix des variantes, la ligne « Prix » du comparateur suit la même règle) ; chiffres alignés ; espaces insécables et `nowrap` ; « Dès » / « FCFA » à 0,7 × en Inter 600 (`formatFCFAParts`)                         |
| `BrandMark`         | S   | `brand`, `size` (meta, lead), `tone` (light, onDark), `href?`                            | pastille de 8 px (`--brand-mark`, décorative) + nom en casse normale à l'encre de la marque ; pose son `data-brand` ; lien de 44 px avec `href`                                                                                                                                                                                                      |
| `VsMark`            | S   | `size` (md 44 px, sm 32 px)                                                              | médaillon « VS » à l'encre VERSUS, anneau blanc de 3 px ; `aria-hidden`, jamais focalisable                                                                                                                                                                                                                                                          |
| `Eyebrow`           | S   | `as`, `tone`                                                                             | alias temporaire : casse normale, pastille accent de 8 px ; remplacé par `BrandMark` aux lots 3 à 5                                                                                                                                                                                                                                                  |
| `Dialog`            | C   | `open`, `onClose`, `labelledBy`/`label`, `variant` (modal, fullscreen), `returnFocusRef` | `<dialog>` natif, Échap, focus piégé (`lib/a11y/focus-trap.ts`), focus rendu ; `onClose` une fois par demande de l'utilisateur ; fermée si `<Activity>` masque la page                                                                                                                                                                               |
| `Breadcrumb`        | S   | `items` (`label`, `href?`)                                                               | « Accueil › Samsung » ; étapes en liens de 44 px, dernière en texte sans lien ni `aria-current` (un seul par page, porté par l'en-tête) ; « › » décoratif                                                                                                                                                                                            |
| `VisuallyHidden`    | S   | —                                                                                        | `sr-only`                                                                                                                                                                                                                                                                                                                                            |
| `SkipLink`          | S   | `targetId`                                                                               | hors écran tant qu'il n'a pas le focus (pas `sr-only`) ; capsule claire de 44 px, au-dessus de l'en-tête collant                                                                                                                                                                                                                                     |
| `ScrollRegion`      | S   | `label`, `className`                                                                     | conteneur à défilement horizontal : `role="region"`, nom, `tabIndex={0}` (défilement au clavier)                                                                                                                                                                                                                                                     |
| `RadioPills`        | S   | `legend`, `name`, `options` (`value`, `label`, `hint?`), `defaultValue`, `nowrap?`       | pastilles à choix unique **sans JavaScript** (refonte §4.7) : `<fieldset>` + `<legend>`, boutons radio natifs invisibles couvrant la pastille (44 px) ; cochée `has-checked` (fond encre), focus `has-focus-visible` ; ce que le choix affiche est décidé en CSS par `:has()` (rail, comparateur). Remplace `Pill` et `PillGroup` (retirés au lot 4) |
| `Drawer`            | C   | `open`, `onClose`, `title`, `titleRef?`, `returnFocusRef`, `footer?`                     | tiroir latéral sur `Dialog` (`<dialog>` natif, focus piégé puis rendu, Échap) ; titre focalisable (`tabIndex={-1}`) ; pied collant ; section dans `/styleguide#panier`                                                                                                                                                                               |

### `src/components/layout/`

| Composant         | S/C | Rôle                                                                                                                                                                                                       |
| ----------------- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AnnouncementBar` | S   | bandeau « Projet pédagogique » (ancien `FictiveNotice`), région « Avertissement »                                                                                                                          |
| `Logo`            | S   | monogramme « V/S » et nom ; lien « VERSUS, accueil » ; zone cliquable de 44 px de haut (pseudo-élément, sans changer la mise en page) ; `onClick` pour le menu mobile                                      |
| `SiteHeader`      | S   | `banner` collant de 56 px ; translucide ≥ 901 px, opaque en dessous                                                                                                                                        |
| `MainNav`         | S   | groupes de `mainNav` séparés par un filet ; `preview` pour le styleguide                                                                                                                                   |
| `NavLink`         | C   | `aria-current="page"` (`usePathname`) si l'adresse est exactement celle de la page, jamais pour une ancre (`nav-current.ts`) ; `markCurrent={false}` pour un lien qui double la navigation principale      |
| `MobileMenu`      | C   | bouton `aria-expanded` + `Dialog` plein écran (≤ 900 px) ; se ferme au clic sur un lien ou le logo, au changement de chemin et quand `<Activity>` masque la page                                           |
| `SiteFooter`      | S   | `contentinfo` : colonnes, moyens de paiement, liens légaux, mentions du bas ; liens `NavLink` (`aria-current`, page courante soulignée, sauf les marques déjà marquées par l'en-tête) de 44 px sous 641 px |
| `PaymentBadges`   | S   | T-Money, Flooz, Carte bancaire, À la livraison (simulés)                                                                                                                                                   |
| `InfoPage`        | S   | gabarit des pages d'information                                                                                                                                                                            |
| `ErrorState`      | S   | contenu des pages 404 et d'erreur                                                                                                                                                                          |

Îlots client ajoutés à l'étape 2 : `MobileMenu` (prévu au §3.4), `Dialog` (utilisé par lui),
`NavLink` (seul `usePathname` l'exige).

### `src/components/brand/` (pages marque, refonte lot 3)

Tous composants serveur, sans JavaScript ; données calculées par `src/lib/catalog/brand-page.ts`
(`productsOfBrand`, `groupByCategory`, `priceSpan`, `brandRangeLabel`, `featuredProducts`,
`otherBrands`, `compareShortcuts`, testés).

| Composant       | Rôle                                                                                                                                                                                                                                                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BrandBanner`   | bandeau `rounded-tile` sur `--brand-ground`, filet de 3 px `--brand-mark` (décoratif), nom en `text-display-brand` à l'encre de la marque, phrase de gamme, résumé calculé, paiements simulés, « Prix indicatifs, boutique fictive », 3 vedettes en éventail (la première est la **seule image prioritaire** de la page), sélecteur |
| `BrandSwitcher` | « Apple vs Samsung vs Xiaomi » : `BrandMark` en lien pour les autres marques, marque affichée encadrée sans lien ni `aria-current`, `VsMark` de 32 px décoratifs                                                                                                                                                                    |
| `CategoryBar`   | « Tout » puis une pastille par catégorie non vide, compte calculé (« 5 produits » pour les lecteurs d'écran) ; liens d'ancre, jamais « page courante » ; collante sous l'en-tête dès 901 px, défilement horizontal sur téléphone ; `anchorPrefix` (styleguide)                                                                      |
| `BrandCompare`  | « Comparer avec » : deux raccourcis vers le comparateur (accueil `#comparer` tant que `/comparer` n'existe pas), nom lu « Samsung Galaxy A57 5G contre Apple iPhone 18 Pro »                                                                                                                                                        |
| `BrandSeeAlso`  | « Voir aussi » : les deux autres marques sur leur fond pastel, avec leur nombre de produits calculé                                                                                                                                                                                                                                 |

`ProductCard` prend `layout="adaptive"` dans `grid-products` (pages marque) : **liste sous 400 px**
(photo de 88 px à gauche ; marque, nom, catégorie, pastilles de coloris, prix et action à droite),
**compacte de 400 à 640 px** (2 colonnes étroites : accroche masquée, photo de 120 px, nom en
17 px sur 2 lignes au plus, environ 330 px de haut à 412 px), verticale au-delà. `category`
(`categoryLabel()`) et `swatches` (`colorSwatches()` : un coloris par `color_slug`, 4 pastilles au
plus puis « +N », noms lus par les lecteurs d'écran) sont optionnels. `featured` : produit phare
de la section, grande carte horizontale sur 2 colonnes dès 901 px (`md:col-span-2` posé par la
page). Le bouton dit « Voir le produit » (règle 4 de la direction) ; la disposition par défaut
(`stack`) reste celle du rail et de la boutique, avec « Acheter » jusqu'aux lots 4 et 5 (E27).

`BrandSwitcher` se resserre sous 420 px (noms en 14 px, « VS » de 28 px, espacements de 4 px) pour
tenir sur une ligne dès 360 px : un « VS » ne commence jamais une ligne. `CategoryBar` collante
(dès 901 px, environ 69 px sous l'en-tête de 56 px) : les liens des grilles de la page marque ont
`scroll-mt-[76px]`, qui s'ajoute au `scroll-padding-top` de `<html>`, pour qu'un lien atteint au
clavier ne passe jamais sous la barre (WCAG 2.4.11, test Maj+Tab).

Pièges de mise en page : un `sr-only` (position absolue) dans un conteneur à défilement horizontal
doit avoir un ancêtre positionné **dans** ce conteneur (`relative` sur le lien), sinon il déborde
du document. Un conteneur `wrap` enfant direct de `<main>` (flex) prend `w-full` : ses marges
automatiques empêchent l'étirement, et le contenu le plus large imposerait sa largeur.

### Formats français (`src/lib/format/`)

`formatFCFA()` (seul formateur de montants), `formatFCFAParts()` (montant et unité séparés pour
`Price`), `formatSpec()` (« 6,3″ », « 6,9 mm », « 5 000 mAh » : virgule, espaces insécables) et
`categoryLabel()` (« Écouteurs », jamais le slug).

### Primitives livrées à l'étape 3

`Price`, `SectionHeader` et `Reveal` sont livrés avec leur premier usage à l'étape 3. Leurs
exemples figurent dans `/styleguide#catalogue`. `Pill` et `PillGroup` (boutons bascule
`aria-pressed`) ont été remplacés au lot 4 de la refonte par `RadioPills`, sans JavaScript.

### Accueil (refonte, lot 4)

Composants serveur sauf mention ; produits issus de `home_slots`, comptes et prix calculés.

| Composant         | Rôle                                                                                                                                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HeroCarousel`    | 3 diapositives (iPhone 18 Pro, Galaxy S26 Ultra, Xiaomi 17 Ultra) **avancées par le visiteur seulement** ; îlots `HeroRotator` et `CarouselControls` (‹ › ● ○ ○, cibles de 44 px, sous le texte, sous la photo sur téléphone) ; diapositives inactives `aria-hidden` et `inert` |
| `HeroSlide`       | `BrandMark` cliquable, titre, prix `<Price size="lead">` (« Dès 970 000 FCFA », 28 / 22 px), « Voir l'iPhone 18 Pro » (primary), « Tout Apple » (page marque), « Comparer » discret ; visuel sans halo flouté ni animation infinie                                              |
| `CategoryNav`     | pastilles avec compteur calculé (Smartphones 13 · Écouteurs 7 · Montres 7 · Bracelets 3), défilantes sur téléphone                                                                                                                                                              |
| `PromoTile`       | 3 tuiles (Galaxy A57 sombre en grand, AirPods Pro 3, Redmi Watch 6) : prix, un bouton centré « Voir le produit », `BrandMark` cliquable à côté du badge « Nouveau » ; 420 px au plus sous 641 px                                                                                |
| `ProductRail`     | « Nouveautés » : filtre par marque **sans JavaScript** (`RadioPills` et `:has()`, nombre de produits lu dans chaque pastille), lien d'en-tête qui suit le filtre en CSS ; seul îlot : `RailArrows` (flèches `aria-disabled`, retour au début au changement de filtre)           |
| `BrandCard`       | « Parcourir par marque » : fond pastel, filet de 3 px, carte entière vers `/marques/<slug>`, « Voir Samsung → », prix d'entrée `<Price from>` ; `VsMark` entre les cartes ; rangées de 112 px sous 641 px                                                                       |
| `CompareShowcase` | tableau dès 641 px (prix en première ligne, `VsMark` dans l'en-tête) ; dessous, une carte par critère, valeurs empilées, montants jamais coupés (à 320 px ils passent entiers à la ligne), liens vers les fiches ; familles en `RadioPills` sans JavaScript (`CompareFamilies`) |
| `FeatureGrid`     | 3 éléments avec icône : Livraison (simulée), Paiement (simulés), Garantie (indicative)                                                                                                                                                                                          |

Les filtres CSS reconnaissent les valeurs `all`, `apple`, `samsung`, `xiaomi` (rail) et `phones`,
`audio`, `wearables` (comparateur) : une nouvelle marque ou famille demande sa règle dans
`globals.css`.

### Panier (étape 5, branche `panier`)

Îlots client ; tout montant vient du devis du serveur (Server Action `priceCart`, ADR 003).

| Composant                    | Rôle                                                                                                                                                                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VariantPicker` (`product/`) | radios natifs Coloris / Capacité / Taille (`<legend>` avec le choix courant), combinaison épuisée grisée et expliquée, adresse `?couleur=&stockage=&taille=` ; vues de chaque variante et prix calculés par le serveur (`variantViews`) |
| `AddToCartButton`            | ajoute sans quitter la fiche, plafonné au stock ; annonce du résultat réel dans une région `status` montée vide (« ajouté », « Quantité maximale atteinte », « Panier plein ») ; « Épuisé » en `aria-disabled`                          |
| `CartButton`                 | icône de l'en-tête : lien vers `/panier` avant l'hydratation, puis bouton « Panier, 3 articles » (`countLabel`) avec `CountBadge` ; charge le tiroir à la demande                                                                       |
| `CartDrawer`                 | mini-panier sur `Drawer` : mêmes lignes, messages et totaux que la page ; état vide avec « Continuer mes achats »                                                                                                                       |
| `CartPage`                   | page `/panier` : lignes, « Vider le panier » (confirmation `ClearCartDialog`), zone de livraison (zones lues par le serveur), récapitulatif, « La commande simulée arrive bientôt », état vide                                          |
| `CartLines`, `CartLineItem`  | quantité (`QuantityStepper`, de 1 à min(5, stock), `aria-disabled` aux bornes), « Retirer » ; focus sur la ligne suivante, sinon sur le titre ; annonces dans une région montée vide ; vignette préparée par le serveur (`LineThumb`)   |
| `CartSummary`, `CartNotices` | sous-total, livraison (« Offerte », « Plus que … FCFA pour la livraison offerte »), total ; avertissements du stockage, corrections du serveur et erreurs (`noticeMessage`, `quoteErrorMessage`)                                        |

### Primitives à venir

Reportées à l'étape de leur premier usage (ADR 002, décision 9) : `Skeleton`, `Select`, `Checkbox`,
`EmptyState` (étape 4) ; `Toaster`, `Spinner` (étape 5 ; `Drawer` est livré avec le panier) ; `Field`, `RadioCard`, `Stepper`
(étape 6). Chacune arrive avec sa section dans `/styleguide` et ses tests.

### Pilotage par `src/config/site.ts`

`mainNav`, `mobileNav`, `headerActions`, `footerColumns`, `legalLinks` ne contiennent que des
routes livrées (`routeFor()`). `brandHref(brand)` est la seule source des liens de marque
(`/marques/<slug>`, lot 3) : en-tête, menu mobile, pied de page, cartes de l'accueil, fiche
produit, boutique, sélecteur et « Voir aussi ». `mainNavHrefs` liste les adresses de la navigation
principale, que le pied de page ne marque pas comme « page courante ». À l'étape 2 : aucune icône ni lien de navigation principale dans
l'en-tête, menu mobile limité à l'aide (livraison, garantie), pied de page Aide + VERSUS.
