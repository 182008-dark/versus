# Journal des modifications

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Une version par étape
du plan (`v0.N.0`), puis `v1.0.0`.

## [Non publié]

### Panier (étape 5 avancée, branche `panier`)

- Panier local versionné (`versus.cart.v1`) : réducteur pur, stockage réparé à la relecture,
  synchronisé entre onglets, magasin lu par `useSyncExternalStore` (aucun écart d'hydratation).
- Devis calculé par le serveur : interface `CartQuoter` au contrat de la RPC `quote_cart`
  (catalogue statique aujourd'hui, Supabase à l'étape 4, ADR 003) ; Server Action `priceCart`
  validée par zod (un prix envoyé est refusé) ; corrections expliquées (variante retirée, quantité
  ramenée au stock) ; vignettes et adresses des fiches préparées par le serveur.
- Fiche : `VariantPicker` (radios Coloris / Capacité / Taille, combinaison épuisée grisée et
  expliquée, adresse `?couleur=&stockage=&taille=`) et `AddToCartButton` (ajout sans quitter la
  fiche, annonce du résultat réel : ajouté, quantité maximale, panier plein, épuisé).
- En-tête : icône « Panier, 3 articles » avec `CountBadge`, tiroir mini-panier (`Drawer` sur
  `<dialog>`, chargé à la demande). Page `/panier` : quantités de 1 à min(5, stock), retrait (focus
  sur la ligne suivante ou le titre), « Vider le panier » avec confirmation, zone de livraison
  (zones lues côté serveur), livraison offerte à Lomé dès 300 000 FCFA, totaux du serveur, état
  vide. Aucune commande ni paiement : « La commande simulée arrive bientôt » (route `commande`
  non livrée).
- Tests : réducteur, stockage, devis, schéma, Server Action, messages, `useCartQuote`,
  `QuantityStepper`, `CartLines`, `CartButton`, `Drawer`, `VariantPicker` ; `e2e/panier.spec.ts`
  (ajout depuis la fiche, rechargement, faux prix ignoré, stock, variante retirée, zones et
  frais, vider, focus, axe sur la page et le tiroir) ; `/panier` ajouté à `hydratation.spec` et
  `budget.spec`. Captures dans `docs/panier/` (`npm run capture:panier`) ; section « Panier » du
  styleguide (tiroir, quantités, récapitulatif).

### Refonte, lot 4 : accueil (branche `panier`)

- Hero manuel (aucune rotation automatique) : iPhone 18 Pro, Galaxy S26 Ultra, Xiaomi 17 Ultra ;
  barre ‹ › ● ○ ○ de 44 px sous le texte (sous la photo sur téléphone) ; prix « Dès 970 000 FCFA »
  en 28 / 22 px ; « Voir l'iPhone 18 Pro », « Tout Apple », « Comparer » ; marque cliquable ; halo
  flouté et animations infinies retirés, fondu de 400 ms.
- Catégories en pastilles avec compteur ; 3 tuiles (A57, AirPods Pro 3, Redmi Watch 6) avec prix,
  un bouton et marque cliquable ; « Nouveautés » avec filtre par marque **sans JavaScript**
  (`RadioPills` et `:has()`) et lien d'en-tête qui suit le filtre ; « Parcourir par marque »
  (cartes pastel vers `/marques/<slug>`, médaillons VS, rangées de 112 px sur téléphone) ;
  comparateur par critère sur téléphone, familles sans JavaScript, groupes de la refonte ;
  réassurance en 3 éléments simulés ou indicatifs ; titres sans surtitre ni point final.
- `Pill` et `PillGroup` remplacés par `RadioPills` ; `useCarouselPause`, icônes lecture/pause et
  champ `visual` des thèmes de marque supprimés ; `ProductCard` scindée (`ProductCardContent`).
- Budget JavaScript : 152 592 octets sur `/` et la fiche (sous 150 Ko), après réductions
  (docs/audits/budget.md) ; Lighthouse mobile mesuré (docs/audits/lighthouse-lot-4.md : LCP
  simulé toujours au-dessus de 2,5 s sur une machine lente, critère ouvert).
- Captures dans `docs/refonte/lot-4/`. Les références de `e2e/visuel.spec.ts` restent celles d'avant
  le lot 4 jusqu'à la revue visuelle (écarts E23, E24 et E27 proposés).

### Refonte, lot 3 : pages marque et liens (branche `refonte-lot-3-marques`)

- Pages `/marques/apple`, `/marques/samsung`, `/marques/xiaomi` générées à l'avance
  (`generateStaticParams` sur les marques, `ensureStatic = "navigation"`) : une marque inconnue
  répond 404 dès la première visite ; métadonnées calculées ; écran d'attente sans animation.
- Contenu : fil d'Ariane, bandeau de marque (résumé « 10 produits · de … à … FCFA » calculé,
  paiements simulés, « Prix indicatifs, boutique fictive », trois vedettes, sélecteur « Apple vs
  Samsung vs Xiaomi »), barre de catégories (catégorie vide masquée : Apple sans bracelets), une
  section par catégorie du plus cher au moins cher, cartes en liste sous 400 px, « Comparer
  avec » et « Voir aussi ». Une seule image prioritaire, aucun nouvel îlot client.
- Tous les liens de marque passent par `brandHref()` et mènent à `/marques/<slug>` : en-tête, menu
  mobile, pied de page (colonne « Tout le catalogue · Apple · Samsung · Xiaomi »), cartes de
  marque de l'accueil, nom de marque de la fiche produit, nouveaux raccourcis de la boutique.
- « Page courante » : adresse exacte seulement, jamais une ancre (`isCurrentLink`) ; le pied de
  page ne double plus la navigation principale (un seul `aria-current="page"` exposé par page).
- Phrases de gamme Samsung et Xiaomi mises à jour pour les 10 produits du lot 1.
- Nouveaux composants : `Breadcrumb`, `BrandBanner`, `BrandSwitcher`, `CategoryBar`,
  `BrandCompare`, `BrandSeeAlso`, `ProductCard layout="adaptive"` ; section « Pages marque » du
  styleguide.
- Tests : `brand-page.test.ts` (sélection par marque, regroupement par catégorie, fourchette,
  vedettes, raccourcis), `nav-current.test.ts`, `site.test.ts` (routes de marque) ;
  `e2e/marques.spec.ts` (10 produits tous de la marque par `data-product` et par nom, comptes
  calculés, chaque lien « Samsung » du site, 404, un seul `aria-current`, axe à 375 et 1440 px,
  pas de défilement horizontal à 320, 360 et 390 px, une image prioritaire) ; budgets JS et poids
  étendus aux pages marque ; références visuelles de l'accueil régénérées. Captures dans
  `docs/refonte/lot-3/`.

- Après revue : cartes compactes de 400 à 640 px (accroche masquée, environ 330 px de haut au
  lieu de 635 à 412 px) ; catégorie et pastilles de coloris dans les cartes des pages marque
  (`colorSwatches()`) ; produit phare de chaque section en grande carte de 2 colonnes dès 901 px ;
  « Voir le produit » au lieu de « Acheter » sur les pages marque (E27 pour le rail, le hero, les
  tuiles et la boutique) ; sélecteur « Apple vs Samsung vs Xiaomi » sur une ligne dès 360 px ;
  marge de défilement des liens sous la barre de catégories collante (WCAG 2.4.11). Tests :
  `colorSwatches`, `ProductCard` (libellé, coloris, phare) ; e2e de hauteur des cartes à 360, 390
  et 412 px, catégorie et coloris à 375 px, grande carte à 1440 px, sélecteur sur une ligne,
  Maj+Tab sous la barre collante. Captures de `docs/refonte/lot-3/` régénérées.

### Refonte, lot 2 : fondations du design (branche `refonte-lot-2-fondations`)

- Gris « pierre » légèrement verdis (`--gray-950` `#1A1D1B` … `--gray-25` `#FAFBFA`, nuit
  `#0B0D0C` / `#141715`), nouveau `--gray-450` ; rôles `--accent-ink` (`#006B4B`, tout texte vert
  sur gris clair), `--badge-new-ink`, `--line-control`, `--price`, `--scrim`, `--outline-image`.
- Thèmes de marque discrets : `--brand-ground`, `--brand-ink`, nouveau `--brand-mark` (pastille et
  filet de 3 px) ; Apple `#F1F2F0` / `#1A1D1B`, Xiaomi `#FFF4EC` / `#9A3D00` / `#FF6900` ;
  `--brand-acc`, `--brand-on-acc` et le bouton `brand` retirés.
- Trois arrondis (28 / 20 / 12 px) avec alias temporaires des sept anciens ; nouvelle ombre de
  carte ; durées 150 / 220 / 400 ms, `--ease-bounce` retirée ; `--space-section` 64 / 96 px et
  `--gutter` 16 / 24 px ; utilitaires `grid-page`, `grid-products`, `text-meta`, `text-card-name`,
  `text-display-brand`.
- Typographie : hero 44 / 64 / 76 px, tuiles et sections en 700, approche −0,03 / −0,025 em, titres
  équilibrés ; plus de petites capitales (surtitre en casse normale, alias temporaire).
- Composants : `Button` à trois variantes (`primary` toujours vert, `secondary`, `onDark`), sans
  agrandissement au survol, enfoncement à l'appui ; `Price` (« Dès 970 000 FCFA », espaces
  insécables, tailles `card`, `lead`, `inline`) ; `Badge` (casse normale, « Épuisé » gris) ;
  nouveaux `BrandMark` et `VsMark` ; `TextLink tone="accentInk"`. Formats `formatFCFAParts`,
  `formatSpec`, `categoryLabel`.
- Tests : parité de tous les tokens (couleurs, translucides, échelles par palier, durées,
  arrondis et alias), 37 paires de contraste AA, test qui exige une paire pour chaque rôle de texte
  employé, contrastes des thèmes de marque ; tests de `Price`, `Badge`, `BrandMark`, `VsMark`.
- `/styleguide` : nouvelles sections « Marques et signature » et « Gabarit », contrastes mesurés
  des thèmes de marque. Captures avant / après dans `docs/refonte/lot-2/`
  (`npm run capture:refonte`, `npm run capture:comparaison`) ; références visuelles de l'accueil
  régénérées. Avenant 1 à l'ADR 002.
- Après revue : « Dès » seulement s'il y a plusieurs prix sur les cartes produit et dans le
  comparateur, comme sur la fiche (nouvelle colonne `max_price_fcfa`, test de rendu de
  `ProductCard`) ; titres de tuile sur `--text-tile` (700, −0,025 em) ; surtitres du hero et des
  tuiles, marque du comparateur et des cartes en casse normale ; tuiles claires Apple et Xiaomi
  sur le pastel et l'encre de `brandThemes`.

### Refonte, lot 1 : catalogue et visuels (branche `refonte-lot-1-catalogue`)

- Catalogue de 30 produits, 10 par marque (21 ajoutés), prix indicatifs = prix officiel en
  France × 655,957 arrondi au millier ; neuf prix existants réalignés (dont iPhone 18 Pro
  970 000 FCFA) ; noms officiels « Galaxy Buds4 » et « Galaxy Watch9 », anciennes adresses
  redirigées (308).
- 30 visuels officiels recadrés avec une marge homogène, 900 px au plus, moins de 200 Ko chacun
  (`ip18.png` : 789 → 157 Ko) ; AVIF puis WebP servis par l'optimiseur d'images.
- Crédits : `public/products/SOURCES.md` et `/credits` lisent les mêmes données ; planche contact
  `docs/refonte/planche-produits.png` (`npm run capture:planche`).
- Boutique : nombre de produits et liste des marques calculés ; test d'intégrité du catalogue et
  test de bout en bout de la boutique ; comparateur : capacités en To au-delà de 1 024 Go.
- Revue des données (17/11/2026) : coloris officiels (Apple Watch Series 12, Galaxy Buds4,
  Galaxy A57 5G, Redmi Note 15 Pro+ 5G, Redmi Watch 6, AirPods Max 2, Xiaomi Buds 6, finition
  Glacier de l’iPhone 18 Pro) ; variante par défaut alignée sur le coloris du visuel (Apple Watch
  Series 12, Xiaomi Buds 6, Smart Band 10) ; autonomie des écouteurs réduction de bruit activée ;
  poids, écrans et indices IP corrigés ; Galaxy Fit3 au dernier prix France (46 000 FCFA) ;
  `aw12.png` sans liseré blanc ; la fiche n’agrandit plus un visuel au-delà de sa taille.

## [0.3.0] : étape 3, accueil, catalogue typé, fiche et boutique (2026-11-17)

Production : <https://versus-ecru.vercel.app> (PR #2 et #3). Critère non tenu : LCP Lighthouse
simulé 3,2 s (seuil 2,5 s), cause et reprise documentées dans `docs/audits/lighthouse-etape-3.md`.

### Ajouté

- Catalogue local typé : `src/data/catalog.ts` (9 produits, variantes, specs, images,
  `home_slots`), `lib/catalog/` (`types.ts` calqué sur la vue `catalog_products` avec les colonnes
  nullables, `CatalogRepository` et sa version statique, `queries.ts` en cache, `isNew`,
  `getToday` qui expire à minuit à Lomé, `VS_TODAY` hors production).
- Accueil complet dans l'ordre du §4.5 : hero (`HeroCarousel` serveur, îlot `HeroRotator`,
  `CarouselControls`, `HeroSlide`), `CategoryNav`, `PromoTile` × 5, Nouveautés (`PillGroup` et
  `ProductRail`), `BrandCard` × 3, `CompareShowcase` (onglets de famille, six lignes clés de
  `lib/compare/rows.ts`), `FeatureGrid` ; `QuizTeaser` prêt et masqué jusqu'à l'étape 5.
- Carrousel accessible (modèle APG) : une seule horloge (fin de l'animation de la barre), pause au
  survol à la souris, au focus et onglet caché, bouton lecture/pause (WCAG 2.2.2), flèches du
  clavier, diapositives `group` « n sur 3 », région `aria-live` à l'arrêt, aucun défilement sous
  mouvement réduit.
- Fiche `/produit/[slug]` (accroche, coloris et prix, caractéristiques, garantie, mention
  « Prix indicatifs ») et `/boutique` groupée par catégorie ; 404 dès la première visite d'un slug
  inconnu (`ensureStatic = "navigation"`).
- `src/app/icon.svg` et `src/app/opengraph-image.tsx` (monogramme V/S, mention du caractère fictif).
- Tests : composants `CarouselControls`, `HeroRotator`, `ProductRail` ; e2e `carrousel.spec.ts`
  (pauses, synchronisation, clavier, tactile, mouvement réduit), `hydratation.spec.ts`, éléments
  masqués de la table de l'étape 3, rail au clavier, répétition des visuels à l'état initial,
  régression visuelle `toHaveScreenshot` à 1440 et 390 px (références Windows), contrastes du hero.
- Audits : `docs/audits/lighthouse-etape-3.md` (rapport HTML et JSON), `budget.md`, `visuel.md` ;
  captures section par section (`npm run capture:accueil`).

### Modifié

- Budget JavaScript ramené au seuil du plan, 150 Ko (le relèvement à 180 Ko n'était pas validé) :
  pages d'erreur sans `Button` ni `next/link`, menu mobile rendu par le serveur autour d'un îlot
  minimal, visuels par `getImageProps()` sans composant client `<Image>`. Le test compte aussi le
  document HTML dans le poids total.
- Largeurs d'images réduites aux tailles utiles (`deviceSizes`, `imageSizes`).
- `PLAYWRIGHT_PORT` permet de lancer les e2e sur un autre port que 3000.
- Registre des écarts : statuts D5, captures avant/après par section, écarts E20 à E24.

### Connu

- Lighthouse mobile : LCP simulé de 3,2 s pour un seuil de 2,5 s (les quatre autres seuils sont
  tenus) ; cause et mesures dans `docs/audits/lighthouse-etape-3.md`, décision à prendre.
- Écarts E5, E6, E12 à E15 et E20 à E22 au statut « proposé », à faire valider.

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
