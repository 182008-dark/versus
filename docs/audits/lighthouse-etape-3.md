# Lighthouse mobile de l'accueil — étape 3

Critère de l'étape 3 (plan, §6) : Lighthouse mobile (Slow 4G) sur `/` avec Performance ≥ 90,
Accessibilité ≥ 95, LCP < 2,5 s, CLS < 0,1 et TBT < 200 ms.

**Résultat : quatre seuils sur cinq tenus. Le LCP (3,2 s) dépasse le seuil de 2,5 s : critère non
tenu**, voir « Analyse du LCP ».

## Conditions

- **Date** : 17 novembre 2026, branche `etape-3-accueil`.
- **Build** : `VS_TODAY=2026-11-12 npm run build`, puis `VS_TODAY=2026-11-12 npx next start -p 3100`
  (compression gzip du serveur Next, HTTP/1.1, machine locale sous Windows 11).
- **Navigateur** : Microsoft Edge 157.0.4341.60 sans interface (Chromium 157). Google Chrome n'est
  pas installé sur la machine ; `CHROME_PATH` désigne donc Edge.
- **Profil** : réglages mobiles par défaut de Lighthouse 13.6.0 : écran 412 × 823 px à 1,75,
  limitation simulée (Lantern) « Slow 4G » (RTT 150 ms, 1,6 Mbit/s, latence 562,5 ms) et
  processeur ralenti 4 fois. Indice de performance de la machine (benchmarkIndex) : 1 631.
- **Commande exacte** (depuis la racine du dépôt) :

  ```bash
  CHROME_PATH="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
    npx --yes lighthouse@13.6.0 http://localhost:3100/ \
    --form-factor=mobile --throttling-method=simulate \
    --only-categories=performance,accessibility,best-practices,seo \
    --output=html --output=json \
    --output-path=docs/audits/etape-3-accueil-mobile \
    --chrome-flags="--headless=new" --quiet
  ```

- **Rapports** : [`etape-3-accueil-mobile.report.html`](etape-3-accueil-mobile.report.html) et
  [`etape-3-accueil-mobile.report.json`](etape-3-accueil-mobile.report.json) (exécution médiane de
  trois).

## Résultats (trois exécutions)

| Exécution  | Performance | Accessibilité | LCP          | CLS   | TBT      | FCP   |
| ---------- | ----------- | ------------- | ------------ | ----- | -------- | ----- |
| 1          | 92          | 100           | 3,2 s        | 0     | 104 ms   | 1,0 s |
| 2 (versée) | 92          | 100           | 3,2 s        | 0     | 122 ms   | 1,1 s |
| 3          | 93          | 100           | 3,2 s        | 0     | 81 ms    | 1,0 s |
| **Seuil**  | ≥ 90        | ≥ 95          | < 2,5 s      | < 0,1 | < 200 ms | —     |
| **Statut** | tenu        | tenu          | **non tenu** | tenu  | tenu     | —     |

Bonnes pratiques : 100. SEO : 66, attendu : la page est volontairement `noindex` (site fictif,
principe 7 du plan), seul l'audit « Page is blocked from indexing » échoue.

Avec le Chromium 157 de Playwright (`chromium-1254`) à la place d'Edge, sur la même machine : LCP
3,3 à 3,7 s et TBT très variable (360 à 1 060 ms). La trace montre de longues tâches de mise en page
dès le premier rendu, y compris sur une page sans feuille de style ; elles viennent de la mise en
page du texte par ce build sous Windows et non du code de l'accueil. Le rapport versé est celui
d'Edge, navigateur réellement installé.

## Corrections apportées pendant l'audit

- **Carrousel** : l'animation d'entrée du visuel ne joue plus au chargement (seulement au
  changement de diapositive) et l'image prioritaire est préchargée : le LCP est désormais mesurable
  (le constat d'audit relevait l'absence d'événement LCP).
- **Diapositives cachées différées** : jusqu'à l'événement `load`, les deux diapositives cachées ne
  sont pas affichées (`data-deferred`), leurs visuels ne concurrencent plus celui de la première.
  Effet mesuré (deux exécutions avant et après, autres réglages identiques) : TBT d'environ 180 à
  environ 145 ms, Performance de 89 à 91. D'une exécution à l'autre, le TBT varie d'environ
  ± 100 ms sur cette machine : c'est pourquoi trois exécutions sont reportées ci-dessus.
- **Tailles d'images** : `deviceSizes` et `imageSizes` réduits aux largeurs utiles (sources de
  618 px au plus), `sizes` des tuiles ajusté à leur taille réelle sur mobile.
- **Pause du carrousel** : la règle de pause n'était pas assez spécifique (le raccourci
  `animation` remettait `animation-play-state` à `running`) ; corrigée et couverte par
  `e2e/carrousel.spec.ts`.

## Analyse du LCP (critère non tenu)

L'élément LCP est le visuel de la première diapositive (`ip18`, 14,7 Ko en WebP, préchargé avec
`fetchpriority="high"`). Mesuré sans limitation, il s'affiche en 0,37 s, au premier rendu. Le
3,2 s vient de la simulation Lantern de Lighthouse : son estimation « pessimiste » du LCP compte
toutes les ressources demandées avant l'affichage observé, donc le JavaScript (150 Ko compressés,
dont environ 135 Ko de React et du routeur Next.js) et les polices (76 Ko), qui partagent la bande
passante Slow 4G avec l'image.

Expériences réalisées pour isoler la cause (même machine, même build) :

| Variante                                                             | LCP simulé  |
| -------------------------------------------------------------------- | ----------- |
| Accueil tel que livré                                                | 3,2 s       |
| Tuiles promotionnelles bloquées (images sous la ligne de flottaison) | 3,4 s       |
| Tuiles et polices bloquées                                           | 3,6 s       |
| CSS en ligne (`experimental.inlineCss`)                              | 3,3 à 3,5 s |
| Polices sans préchargement                                           | 3,6 s       |
| `content-visibility: auto` sur les sections basses                   | 3,4 à 3,5 s |
| **Tout le JavaScript bloqué** (`/_next/static/chunks/*.js`)          | **2,3 s**   |

Seule la suppression du JavaScript ramène le LCP sous 2,5 s. Pour comparaison, la fiche
`/produit/iphone-18-pro` (même JavaScript, moins de contenu) obtient 2,7 s et `/cgv` (LCP textuel)
0,8 s. Le JavaScript chargé est déjà au budget du plan (`docs/audits/budget.md`) et l'essentiel est
le socle du framework, que l'accueil ne peut pas réduire. Tenir 2,5 s demanderait donc une décision
d'architecture (par exemple retarder le chargement du JavaScript de Next.js, ce que le framework ne
permet pas, ou changer d'élément LCP), à arbitrer par l'utilisateur. Les variantes testées qui
n'apportaient rien ont été retirées.

## Reproduire

1. `VS_TODAY=2026-11-12 npm run build`, puis `VS_TODAY=2026-11-12 npx next start -p 3100`.
2. Lancer la commande ci-dessus (adapter `CHROME_PATH` au navigateur installé ; sous Linux, Chrome
   est trouvé sans variable).
3. Lire les cinq valeurs dans le rapport HTML (section Performance et Accessibilité).
