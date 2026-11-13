# Design system VERSUS

Référence : `docs/PLAN.md` §4, ADR [002](decisions/002-design-system.md). Vitrine vivante :
`/styleguide` (local, preview et `next start` ; 404 en production).

## 1. Tokens

Fichier unique : `src/app/globals.css`, en trois couches.

### Primitives (maquette)

| Famille       | Tokens                                                                    |
| ------------- | ------------------------------------------------------------------------- |
| Neutres       | `--white`, `--black`, `--gray-950` (encre) à `--gray-25`                  |
| Nuit          | `--night-950`, `--night-900` (fond du quiz), `--night-800`, `--night-700` |
| Accent VERSUS | `--green-700`, `--green-600`, `--green-300`, `--green-50` (décision D1)   |
| États         | `--red-700` (erreur), `--amber-800` (avertissement)                       |

### Rôles sémantiques (les seuls utilisés par les composants)

| Rôle                                                      | Primitive                                         | Classe Tailwind                            |
| --------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| `--bg`, `--ink`, `--ink-strong`                           | white, gray-950, black                            | `bg-bg`, `text-ink`, `text-ink-strong`     |
| `--surface`, `--surface-2`, `--surface-hover`             | gray-50, gray-25, gray-100                        | `bg-surface`…                              |
| `--surface-dark`, `--surface-dark-2`                      | night-900, night-800                              | `bg-surface-dark`…                         |
| `--line`, `--line-soft`, `--line-strong`                  | gray-300, gray-200, noir 20 %                     | `border-line`…                             |
| `--muted`, `--muted-strong`                               | gray-600, gray-700                                | `text-muted`…                              |
| `--muted-on-dark`, `--eyebrow-on-dark`                    | gray-400, gray-500                                | `text-muted-on-dark`…                      |
| `--accent`, `--accent-hover`                              | green-600, green-700                              | `bg-accent`, `state-hover:bg-accent-hover` |
| `--accent-on-dark`, `--accent-soft`                       | green-300, green-50                               | `text-accent-on-dark`, `bg-accent-soft`    |
| `--on-accent`, `--on-dark`                                | white                                             | `text-on-accent`, `text-on-dark`           |
| `--danger`, `--warning`                                   | red-700, amber-800                                | `text-danger`, `text-warning`              |
| `--focus-ring`                                            | accent (accent-on-dark sous `[data-tone="dark"]`) | — (règle globale)                          |
| `--notice-bg`, `--notice-ink`                             | gray-950, gray-300                                | bandeau « Projet pédagogique »             |
| `--header-bg`, `--header-bg-translucent`, `--header-line` | blanc, blanc 78 %, noir 7 %                       | en-tête                                    |

La palette par défaut de Tailwind est retirée (`--color-*: initial`) : `bg-blue-500` n'existe pas.

### Thèmes de marque

`[data-brand="apple|samsung|xiaomi"]` définit `--brand-ground`, `--brand-ink`, `--brand-acc` et
`--brand-on-acc` (classes `bg-brand-ground`, `text-brand-ink`, variante de bouton `brand`). Les
mêmes valeurs sont dans `src/lib/brand-themes.ts` (parité testée), avec les dégradés du hero
(`heroStyle(brand)` → variables `--hero-from/via/to`) et les couleurs du SVG de secours.

### Contrastes

Calculés par `src/lib/color/contrast.ts` (luminance relative et ratio WCAG 2.2, testés) et
affichés dans `/styleguide`. Extrait :

| Paire                                       | Ratio   | Niveau |
| ------------------------------------------- | ------- | ------ |
| `--accent` sur blanc / blanc sur `--accent` | 4,95:1  | AA     |
| blanc sur `--accent-hover`                  | 6,55:1  | AA     |
| `--accent-hover` sur `--accent-soft`        | 5,78:1  | AA     |
| `--accent-on-dark` sur `--surface-dark`     | 11,13:1 | AAA    |
| `--muted` sur `--surface` (pied de page)    | 4,65:1  | AA     |

Règle : `--muted` ne se pose pas sur un fond de marque (4,49:1 sur le fond Samsung) ; utiliser
`--brand-ink`.

### Typographie

| Usage            | Classe / variable                    | ≤ 640 px | ≥ 641 px | ≥ 1025 px |
| ---------------- | ------------------------------------ | -------- | -------- | --------- |
| Titre du hero    | `text-display-hero`                  | 48       | 64       | 88        |
| Titre de tuile   | `text-display-tile`                  | 40       | 58       | 58        |
| Titre de section | `text-display-h2`                    | 36       | 52       | 52        |
| Question du quiz | `var(--text-quiz)`                   | 24       | 30       | 30        |
| Sous-titre       | `var(--text-sub)`                    | 17       | 21       | 21        |
| Surtitre         | `eyebrow` (13 px, capitales, 0,1 em) | 13       | 13       | 13        |

Titres `h1`–`h4` en Plus Jakarta Sans (600–800), texte en Inter ; polices servies par
`next/font` (`src/app/fonts.ts`, partagé avec `global-error.tsx`).

### Autres tokens

Rayons `rounded-tile` 30, `box` 28, `card` 26, `result` 18, `option` 16, `icon` 14, `chip` 8 ;
ombres `shadow-card`, `shadow-tray` ; courbes `ease-out` (0.2, 0.7, 0.2, 1) et `ease-bounce`.
Utilitaires : `wrap` (1240 px de contenu + 24 px de marge), `section` (76 puis 110 px),
`eyebrow`, `prose-info` (pages d'information).

## 2. Points de rupture : maquette → mobile d'abord

La maquette est écrite en `max-width` (bureau d'abord). VERSUS est écrit en `min-width` (mobile
d'abord) avec des seuils équivalents : `max-width: 640px` ⇔ « en dessous de `sm` ».

| Maquette (`max-width`) | VERSUS                         | Ce qui change                                              |
| ---------------------- | ------------------------------ | ---------------------------------------------------------- |
| ≤ 640 px               | base (< 641 px)                | typographie mobile, sections 76 px, pied de page 1 colonne |
| ≤ 900 px               | base et `sm` (< 901 px)        | navigation masquée, **menu mobile** ; en-tête opaque       |
| ≤ 1024 px              | `md` (901–1024 px)             | pied de page 2 colonnes, hero 64 px                        |
| > 1024 px              | `lg` (≥ 1025 px), `xl` 1240 px | pied de page 1,6 fr + 3 colonnes, hero 88 px               |

Points de rupture déclarés dans `@theme` : `sm` 641, `md` 901, `lg` 1025, `xl` 1240.

## 3. États et mouvement

- `state-hover:`, `state-focus:`, `state-active:` : vrai état **ou** `data-state="…"` (styleguide).
- Anneau de focus global : `:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px }`.
- `src/styles/animations.css` : keyframes `up`, `fade`, `art-in`, `float`, `glow`, `spin`, `fill`,
  `bump`, `tray-in`, `q-in`, `zoom`, `rise` ; classes `anim-*` et `.reveal/.zoom/.rise` sous
  `prefers-reduced-motion: no-preference` ; état par défaut toujours visible ; sous mouvement
  réduit, aucune animation ni transition.

## 4. Composants

### `src/components/ui/`

| Composant           | S/C | Props principales                                                                                    | Notes                                                                                                                           |
| ------------------- | --- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `Button`            | S   | `variant` (primary, dark, light, outline, onDark, brand), `size` (md 44, lg 48), `href?`, `pressed?` | `href` → `<Link>` ; sinon `type="button"` ; `aria-pressed` ; `scale(1.04)` sous `motion-safe` ; classes dans `button-styles.ts` |
| `TextLink`          | S   | `href`, `tone` (accent, ink, light, accentOnDark), `arrow?`                                          | 44 px de haut ; flèche décalée au survol et au focus                                                                            |
| `Arrow`             | S   | —                                                                                                    | « → », `aria-hidden`                                                                                                            |
| `IconButton`        | S/C | `label`, `icon`, `count?`, `countUnits?`, `href?`                                                    | nom « Panier, 3 articles » (`countLabel`), `aria-live`                                                                          |
| `CountBadge`        | S   | `value`                                                                                              | pastille accent ; `bump` rejoué par `key`                                                                                       |
| `Icon`              | S   | `name` (search, compare, account, cart, menu, close)                                                 | tracés de la maquette, `aria-hidden`                                                                                            |
| `Badge`, `NewBadge` | S   | `tone` (accent, neutral, onDark)                                                                     | capsule ; « Nouveau » en `accent-soft`                                                                                          |
| `Eyebrow`           | S   | `as`, `tone`                                                                                         | carré accent de 6 px                                                                                                            |
| `Dialog`            | C   | `open`, `onClose`, `labelledBy`/`label`, `variant` (modal, fullscreen), `returnFocusRef`             | `<dialog>` natif, Échap, focus piégé (`lib/a11y/focus-trap.ts`), focus rendu                                                    |
| `VisuallyHidden`    | S   | —                                                                                                    | `sr-only`                                                                                                                       |
| `SkipLink`          | S   | `targetId`                                                                                           | au-dessus de l'en-tête collant                                                                                                  |

### `src/components/layout/`

| Composant         | S/C | Rôle                                                                        |
| ----------------- | --- | --------------------------------------------------------------------------- |
| `AnnouncementBar` | S   | bandeau « Projet pédagogique » (ancien `FictiveNotice`)                     |
| `Logo`            | S   | monogramme « V/S » et nom ; lien « VERSUS, accueil »                        |
| `SiteHeader`      | S   | `banner` collant de 56 px ; translucide ≥ 901 px, opaque en dessous         |
| `MainNav`         | S   | groupes de `mainNav` séparés par un filet ; `preview` pour le styleguide    |
| `NavLink`         | C   | `aria-current="page"` (`usePathname`)                                       |
| `MobileMenu`      | C   | bouton `aria-expanded` + `Dialog` plein écran (≤ 900 px)                    |
| `SiteFooter`      | S   | `contentinfo` : colonnes, moyens de paiement, liens légaux, mentions du bas |
| `PaymentBadges`   | S   | T-Money, Flooz, Carte bancaire, À la livraison (simulés)                    |
| `InfoPage`        | S   | gabarit des pages d'information                                             |
| `ErrorState`      | S   | contenu des pages 404 et d'erreur                                           |

Îlots client ajoutés à l'étape 2 : `MobileMenu` (prévu au §3.4), `Dialog` (utilisé par lui),
`NavLink` (seul `usePathname` l'exige).

### Pilotage par `src/config/site.ts`

`mainNav`, `mobileNav`, `headerActions`, `footerColumns`, `legalLinks` ne contiennent que des
routes livrées (`routeFor()`). À l'étape 2 : aucune icône ni lien de navigation principale dans
l'en-tête, menu mobile limité à l'aide (livraison, garantie), pied de page Aide + VERSUS.
