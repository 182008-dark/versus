# Lighthouse mobile de l'accueil — lot 4 de la refonte (et panier)

Critères (plan, §6 étape 3, repris par la refonte §6 lot 4) : Lighthouse mobile (Slow 4G) sur `/`
avec Performance ≥ 90, Accessibilité ≥ 95, LCP < 2,5 s, CLS < 0,1 et TBT < 200 ms. Le lot 4 devait
ramener le LCP simulé (3,2 s à l'étape 3) sous 2,5 s grâce au hero allégé.

**Résultat : Accessibilité (100) et CLS (0) tenus. LCP, TBT et Performance non tenus dans les
conditions de cette mesure**, sur une machine nettement plus lente qu'à l'étape 3 (voir
« Lecture des résultats »). Le critère du LCP reste ouvert.

## Conditions

- **Date** : 18 novembre 2026, branche `panier` (lot 4 de l'accueil et panier).
- **Build** : `VS_TODAY=2026-11-12 npm run build`, puis `VS_TODAY=2026-11-12 npx next start -p 3123`.
- **Navigateur** : Microsoft Edge 157.0.4341.60 sans interface, comme à l'étape 3. Lancé à la main
  avec un port de débogage, Lighthouse s'y connectant par `--port` : le lancement par
  `CHROME_PATH` échouait sur cette machine (« waiting for dynamic debugging port »).
- **Profil** : réglages mobiles par défaut de Lighthouse 13.6.0 (412 × 823 px, Lantern « Slow 4G »,
  processeur ralenti 4 fois). Indice de performance de la machine (benchmarkIndex) : **435 à 683**,
  contre 1 631 à l'étape 3.
- **Commande exacte** (depuis la racine du dépôt) :

  ```bash
  "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new \
    --remote-debugging-port=9333 --user-data-dir=<dossier temporaire> --no-first-run about:blank &
  npx --yes lighthouse@13.6.0 http://localhost:3123/ --port=9333 \
    --form-factor=mobile --throttling-method=simulate \
    --only-categories=performance,accessibility,best-practices,seo \
    --output=html --output=json --output-path=docs/audits/lot-4-accueil-mobile --quiet
  ```

- **Rapports** : [`lot-4-accueil-mobile.report.html`](lot-4-accueil-mobile.report.html) et
  [`lot-4-accueil-mobile.report.json`](lot-4-accueil-mobile.report.json) (exécution 2, médiane
  des six pour la Performance).

## Résultats (six exécutions)

| Exécution  | Performance  | Accessibilité | LCP          | CLS   | TBT          | FCP   | benchmarkIndex |
| ---------- | ------------ | ------------- | ------------ | ----- | ------------ | ----- | -------------- |
| 1          | 76           | 100           | 3,0 s        | 0     | 760 ms       | 0,9 s | 436            |
| 2 (versée) | 79           | 100           | 3,4 s        | 0     | 490 ms       | 1,2 s | 634            |
| 3          | 89           | 100           | 2,4 s        | 0     | 370 ms       | 1,1 s | 683            |
| 4          | 79           | 100           | 3,4 s        | 0     | 450 ms       | 1,7 s | 546            |
| 5          | 83           | 100           | 2,5 s        | 0     | 580 ms       | 1,4 s | 618            |
| 6          | 74           | 100           | 3,2 s        | 0     | 750 ms       | 1,6 s | 621            |
| **Seuil**  | ≥ 90         | ≥ 95          | < 2,5 s      | < 0,1 | < 200 ms     | —     | —              |
| **Statut** | **non tenu** | tenu          | **non tenu** | tenu  | **non tenu** | —     | —              |

Bonnes pratiques : 96 (100 à l'étape 3). Seul l'audit « Issues were logged in the Issues panel »
échoue, sur un problème « Content security policy » sans adresse : le site n'envoie aucun en-tête
CSP ; il vient vraisemblablement du navigateur piloté par `--port`. SEO : 66, attendu
(`noindex` volontaire, principe 7 du plan).

## Lecture des résultats

- **Machine plus lente** : avec un benchmarkIndex 2,4 à 3,7 fois plus faible qu'à l'étape 3, le
  ralentissement « 4 fois » de Lighthouse s'applique à un processeur déjà lent ; le travail du
  fil principal mesuré passe à 2,5 à 4,2 s. Le TBT et la Performance de ce tableau ne sont donc
  pas comparables à ceux de l'étape 3 (92, 104 ms). Une mesure de contrôle de `b744cd5` dans les
  mêmes conditions n'a pas pu être faite (la copie de travail ne trouvait pas `node_modules`).
- **LCP** : l'élément LCP reste le visuel de la première diapositive. Sans limitation, il
  s'affiche en 0,33 à 0,59 s (décomposition Lighthouse : premier octet 20 à 28 ms, chargement 40 à
  77 ms, rendu 245 à 350 ms). Le chiffre simulé (2,4 à 3,4 s, médiane 3,1 s) vient, comme à
  l'étape 3, de l'estimation Lantern qui compte toutes les ressources demandées avant l'affichage
  (environ 150 Ko de JavaScript et 76 Ko de polices sur Slow 4G).
- **Ce que le lot 4 a allégé** : halo flouté (`filter: blur(60px)`) remplacé par un dégradé
  statique, animations infinies (lueur, rotation, flottement) retirées, fondu ramené à
  `--dur-slow` (400 ms), hero plus bas sur téléphone, filtres du rail et du comparateur passés en
  CSS (îlots plus petits). Poids total de `/` : 473 310 octets (514 287 à l'étape 3).

## À faire

- Refaire la mesure sur une machine au repos (benchmarkIndex proche de 1 600) pour la comparer à
  l'étape 3, idéalement avec `b744cd5` mesuré dans les mêmes conditions.
- Si le LCP simulé reste au-dessus de 2,5 s : décider (utilisateur) entre précharger une seule
  police au premier affichage, réduire le JavaScript du framework chargé avant le visuel, ou
  accepter l'écart comme à l'étape 3.
