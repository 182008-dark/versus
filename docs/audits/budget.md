# Budget JavaScript et poids de l'accueil — étape 3, lot 4 et panier

Seuils du plan (§4.5 et §7.1), vérifiés par `e2e/budget.spec.ts` :

- JavaScript compressé (somme des `transferSize` des scripts `/_next/static/…js`) < **150 Ko**
  (153 600 octets) sur `/` et sur `/produit/iphone-18-pro` ;
- poids total transféré de `/` après défilement complet, **document HTML compris** (entrée
  `navigation`), < 1 Mo.

Le relèvement à 180 Ko fait dans le commit `ac1f2d9` n'avait pas été décidé par l'utilisateur : le
seuil est revenu à 150 Ko et le code a été allégé pour le tenir.

## Mesures du 18 novembre 2026 (lot 4 de l'accueil et panier, branche `panier`)

Même procédure (build de production, `VS_TODAY=2026-11-12`, Chromium de Playwright, contexte neuf,
1440 × 900 px, défilement complet).

| Page                     | JavaScript transféré     | Total transféré | Seuil JS                 |
| ------------------------ | ------------------------ | --------------- | ------------------------ |
| `/`                      | **152 592 o** (149,0 Ko) | 473 370 o       | < 153 600 o : tenu       |
| `/produit/iphone-18-pro` | **152 592 o** (149,0 Ko) | 319 830 o       | < 153 600 o : tenu       |
| `/panier` (vide)         | 156 595 o (152,9 Ko)     | 320 437 o       | aucun seuil dans le plan |

Marge sur `/` et la fiche : 1 008 octets (2 369 à l'étape 3, 895 sur `b744cd5`). Avant les
réductions ci-dessous, la branche mesurait 157 192 octets sur `/` et 163 725 sur `/panier`.

`/` et la fiche chargent les mêmes morceaux : le socle (React, routeur, exécution Next.js, environ
137 Ko), le gabarit (6 723 o gzip -9 : `next/link`, menu mobile, icône du panier et magasin du
panier), les trois limites d'erreur (3 805 o), les îlots de l'accueil (1 596 o : carrousel et
flèches du rail) et l'îlot de la fiche (1 587 o : `VariantPicker`, `AddToCartButton`), préchargé
par les liens des cartes. `/panier` y ajoute son îlot (environ 5,6 Ko) mais pas celui de la fiche.

### Réductions appliquées (de 157 192 à 152 592 octets sur `/`)

1. **Fiche** : les groupes d'options, le nom, le texte de stock et le prix de chaque variante sont
   calculés par le serveur (`variantViews`, `<Price>` rendu en props) ; l'îlot ne garde que la
   bascule et `matchSearch` ; classes du bouton passées par le serveur ; annonce d'ajout dans son
   propre module (`add-outcome.ts`). Morceau de la fiche : de 4 008 à 1 872 octets transférés.
2. **Filtres sans JavaScript** (refonte §4.7) : rail « Nouveautés » et familles du comparateur en
   boutons radio et `:has()` (`RadioPills`) ; `PillGroup`, `Pill` et l'îlot `CompareFamilies`
   retirés, seul `RailArrows` reste. Îlots de l'accueil : de 2 999 à 1 870 octets.
3. **Magasin du panier** : `maxQuantityPerLine` dans `config/cart-limits.ts`, pour ne plus copier
   les zones et frais de livraison (`policies.ts`) dans le gabarit.
4. **Limites d'erreur** : `ErrorActions` écrit ses deux jeux de classes en toutes lettres (test de
   parité avec `buttonClasses`) et `ErrorState` n'importe plus `Eyebrow` ni `clsx` : de 5 680 à
   4 642 octets transférés pour les trois.
5. **Page panier** : vignettes et adresses des fiches préparées par la Server Action (`media`) ;
   `next/image` et `config/site.ts` ne partent plus dans l'îlot (environ 5 Ko de moins).

### `/panier` au-dessus de 150 Ko

Le plan fixe le seuil sur `/` et une fiche (§7.1) ; aucun n'est fixé pour `/panier`. La page
dépasse 150 Ko de 3 Ko : son îlot (lignes, quantités, récapitulatif, devis, messages) s'ajoute à un
socle commun déjà à 151 Ko. `e2e/budget.spec.ts` mesure son poids total (< 1 Mo) et joint son
JavaScript au rapport (annotation), sans seuil. Fixer un seuil pour cette page (et les moyens de
le tenir : par exemple un îlot panier chargé après le premier affichage) est une décision à
prendre avec l'utilisateur.

## Mesures du 17 novembre 2026

`VS_TODAY=2026-11-12 npm run build && npx next start` (gzip de Next), Chromium de Playwright,
contexte neuf sans cache, 1440 × 900 px.

| Page                     | JavaScript transféré     | Document | Total transféré |
| ------------------------ | ------------------------ | -------- | --------------- |
| `/`                      | **151 231 o** (147,7 Ko) | 22 488 o | 514 287 o       |
| `/produit/iphone-18-pro` | **151 231 o** (147,7 Ko) | 10 183 o | 300 642 o       |
| Seuil                    | < 153 600 o (150 Ko)     | —        | < 1 048 576 o   |

Marge : 2 369 octets. Les deux pages chargent les mêmes morceaux : la fiche précharge aussi ceux de
l'accueil (lien du logo).

Détail des scripts de `/` (gzip -9 des fichiers de `.next/static/chunks`, hors en-têtes HTTP) :

| Octets | Contenu                                                                                               |
| ------ | ----------------------------------------------------------------------------------------------------- |
| 73 141 | React DOM                                                                                             |
| 46 478 | routeur client de Next.js                                                                             |
| 7 687  | exécution Next.js (prérendu, erreurs)                                                                 |
| 4 382  | chargeur Turbopack                                                                                    |
| 3 629  | racine de page client de Next.js                                                                      |
| 4 970  | `next/link`, `NavLink`, îlot du menu mobile (`MobileMenuDialog`)                                      |
| 2 687  | îlots de l'accueil : `HeroRotator`, `CarouselControls`, `ProductRail`, `CompareFamilies`, `PillGroup` |
| 2 058  | `global-error.tsx`                                                                                    |
| 1 641  | `error.tsx`                                                                                           |
| 1 255  | `(site)/error.tsx`                                                                                    |

Le polyfill `noModule` (39 392 octets) n'est pas téléchargé par les navigateurs récents et n'est
pas compté. Le socle du framework pèse environ 135 Ko ; le code de l'application environ 13 Ko.

## Réductions appliquées (de 175 328 à 151 231 octets)

1. **Pages d'erreur sans `Button`, `next/link` ni `config/site.ts`** : `ErrorActions` emploie un
   `<button>` et un `<a href="/">` natifs avec les classes de `button-styles.ts` ; le texte du
   bandeau vient de `config/notice.ts`.
2. **Menu mobile** : `MobileMenu` est un composant serveur qui rend les liens et les icônes ;
   l'îlot `MobileMenuDialog` ne gère que l'ouverture.
3. **Visuels sans le composant client `<Image>`** : `ProductVisual` appelle `getImageProps()` de
   `next/image` sur le serveur (mêmes `src`, `srcSet`, `sizes` et garde-fous de l'optimiseur) et
   précharge l'image prioritaire avec `preload()` de React.
4. **Îlots minimaux** : diapositives (`HeroSlide`), cartes (`ProductCard`) et tableaux du
   comparateur rendus par le serveur et passés en `children` ou en props aux îlots client.

## Diagnostiquer un dépassement

```bash
VS_TODAY=2026-11-12 npm run build
npx next start -p 3100 &
PLAYWRIGHT_PORT=3100 npx playwright test e2e/budget.spec.ts
```

Le message d'échec donne le total en octets. Pour la répartition par fichier, compresser les
morceaux référencés par le HTML : `curl -s localhost:3100/ | grep -oE '/_next/static/chunks/[^"]+\.js'`,
puis `gzip -9c .next/static/chunks/<fichier> | wc -c`.
