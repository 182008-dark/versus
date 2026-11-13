# Journal des modifications

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Une version par étape
du plan (`v0.N.0`), puis `v1.0.0`.

## [Non publié]

## [0.2.0] : étape 2, design system et gabarit global (2026-11-13)

Production : <https://versus-ecru.vercel.app> (PR #1).

### Ajouté

- Design system en trois couches dans `globals.css` (primitives, rôles, pont `@theme inline`),
  points de rupture mobile d'abord (641, 901, 1025, 1240 px), palette Tailwind par défaut retirée,
  utilitaires `wrap`, `section`, `eyebrow`, `text-display-*`, `prose-info`, anneau de focus de
  2 px et variantes `state-hover`, `state-focus`, `state-active` (ADR 002).
- Accent VERSUS vert `#00805A` (décision D1) : contrastes mesurés par `src/lib/color/contrast.ts`
  (WCAG 2.2, testé) et affichés dans `/styleguide`.
- `src/styles/animations.css` (état par défaut visible, animations sous
  `prefers-reduced-motion: no-preference`) et `src/lib/brand-themes.ts` (thèmes de marque,
  dégradés du hero, couleurs du SVG de secours).
- Composants `ui/` : `Button`, `TextLink`, `Arrow`, `IconButton`, `CountBadge`, `Icon`, `Badge`,
  `NewBadge`, `Eyebrow`, `Dialog` (`<dialog>` natif, focus piégé), `VisuallyHidden`.
- Gabarit : `AnnouncementBar` (ancien `FictiveNotice`), `Logo` (monogramme « V/S »),
  `SiteHeader`, `MainNav`, `NavLink`, `MobileMenu` (≤ 900 px), `SiteFooter`, `PaymentBadges`,
  pilotés par `src/config/site.ts` (liens non livrés absents du DOM).
- Pages `/confidentialite`, `/cgv`, `/livraison` et `/garantie` (contenu pédagogique), `error.tsx`
  (racine et `(site)`), `global-error.tsx`, page 404 dans le gabarit.
- `/styleguide` : couleurs, contrastes mesurés, typographie, tous les états des boutons et des
  liens, badges, logo, focus, thèmes ; 404 en production (`VERCEL_ENV`, pas `NODE_ENV`).
- Tests : contraste, parité tokens CSS/TS et thèmes de marque, règle du styleguide, focus piégé,
  `Dialog`, `Button`, `IconButton`, pages d'erreur ; e2e `gabarit.spec.ts` (landmarks, menu
  mobile au clavier, pas de défilement horizontal à 375 px, axe) ; `liens.spec` et
  `accueil.spec` étendus aux nouvelles pages.
- `npm run capture:gabarit` et captures de l'implémentation (`docs/maquette/implementation/`).
- Documentation : `docs/design-system.md`, `docs/ecarts-maquette.md` (v1), ADR 002.

### Modifié

- `src/config/site.ts` : routes de l'étape 2 livrées, navigation, icônes, colonnes du pied de
  page et liens légaux.
- Mentions légales et crédits passent au gabarit `InfoPage` ; l'accueil provisoire n'a plus sa
  propre liste de liens (elle est dans le pied de page).
- Polices déclarées dans `src/app/fonts.ts` (partagé avec `global-error.tsx`).
- `vitest.setup.ts` : nettoyage de Testing Library entre les tests et `showModal()` pour jsdom.

### Corrigé (relecture de l'étape 2)

- Menu mobile : le logo ferme le menu ; le menu se ferme aussi au changement de chemin et quand
  `<Activity>` masque la page quittée, et `Dialog` se ferme au masquage (plus de `<dialog>`
  modal caché qui rendait l'accueil inerte). `onClose` n'est plus appelé deux fois.
- Accessibilité : tableaux défilants atteignables au clavier (`ScrollRegion`), lien d'évitement
  de 44 px et contrasté, bandeau dans une région nommée, `aria-current` dans le pied de page,
  cibles de 44 px (lien de fin des pages d'information, pied de page sous 641 px, logo), logos
  du styleguide qui passent à la ligne à 320 px ; axe à 375 px et règle `region` dans les e2e.
- Design system : parité `globals.css` / `design-tokens.ts` testée dans les deux sens, pont
  Tailwind limité aux rôles (plus de `text-white`), `state-hover` sous `@media (hover: hover)`.
- Primitives `ui/` restantes rattachées aux étapes 3 à 6 (ADR 002, décision 9 ; plan, révision 3).

## [0.1.0] : étape 1, socle (2026-11-13)

### Ajouté

- Projet Next.js 16.4.6 (App Router, Turbopack, Cache Components) créé avec create-next-app,
  agent feedback désactivé.
- Versions exactes partout (`.npmrc` `save-exact=true`, lockfile), Node 24 (`.nvmrc`, `engines`).
- Page d'accueil provisoire « Bientôt en ligne » avec le bandeau « Projet pédagogique · Site
  fictif, aucune vente réelle · Prix indicatifs en FCFA ».
- Mentions légales et crédits provisoires, page 404 en français.
- `noindex` et `robots.txt` (`Disallow: /`) tant que `ALLOW_INDEXING !== "true"`.
- `src/lib/env.ts` (zod), `formatFCFA`, `src/config/site.ts` (routes livrées) et leurs tests.
- `scripts/check-forbidden.mjs` et son test, tests e2e `liens` et `accueil` (axe compris).
- CI GitHub Actions (`qualite`, `e2e`), modèle de PR, ADR 001, glossaire.
- Captures de la maquette à 1440 et 390 px (`scripts/capture-maquette.ts`).
- Composant `FictiveNotice` : le bandeau « Projet pédagogique » s'affiche aussi sur la page 404.
- Tests e2e : bandeau et `noindex` vérifiés sur chaque page publique et sur la page 404.

- Mise en production sur Vercel : <https://versus-ecru.vercel.app> (projet `versus` du compte
  personnel, variables `NEXT_PUBLIC_SITE_URL` en production et `ALLOW_INDEXING=false`).

### Corrigé

- `check:forbidden` : chemins Windows normalisés quelle que soit la plateforme (le test échouait
  sous Linux, donc en CI) ; `href: "#"` refusé aussi dans les objets de configuration ; une ancre
  comme `href="#ace"` n'est plus prise pour une couleur.
- `liens.spec` : `href=""`, `href="/#"` et `href="/credits#"` sont détectés comme liens vers nulle
  part.
- Critère d'acceptation « aucun secret » reformulé en `git grep -nE "sb_secret_[A-Za-z0-9]"`, la
  copie du plan dans `docs/PLAN.md` mentionnant le préfixe `sb_secret_` (voir ADR 001).
