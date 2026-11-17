# Budget JavaScript et poids de l'accueil — étape 3

Seuils du plan (§4.5 et §7.1), vérifiés par `e2e/budget.spec.ts` :

- JavaScript compressé (somme des `transferSize` des scripts `/_next/static/…js`) < **150 Ko**
  (153 600 octets) sur `/` et sur `/produit/iphone-18-pro` ;
- poids total transféré de `/` après défilement complet, **document HTML compris** (entrée
  `navigation`), < 1 Mo.

Le relèvement à 180 Ko fait dans le commit `ac1f2d9` n'avait pas été décidé par l'utilisateur : le
seuil est revenu à 150 Ko et le code a été allégé pour le tenir.

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
