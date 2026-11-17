# Fidélité à la maquette — étape 3

Référence : `Accueil VERSUS-html/Main.dc.html`. Une ligne par section (§4.6 du plan) : capture de
la maquette (`docs/maquette/captures/<largeur>/`), capture de l'implémentation
(`docs/maquette/implementation/<largeur>/`, mêmes noms de fichier), statut ou renvoi vers l'écart
du registre (`docs/ecarts-maquette.md`).

Captures de l'implémentation : `npm run capture:accueil` le 17 novembre 2026, build de production,
`VS_TODAY=2026-11-12`, mouvement réduit (première diapositive, sans défilement automatique).
Régression visuelle : `e2e/visuel.spec.ts` (références `e2e/visuel.spec.ts-snapshots/`, procédure
dans `docs/audits/visuel.md`).

| Section                | Captures (1440 et 390)             | Implémentation                                                                                                                                                                                                              | Statut                                               |
| ---------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| En-tête                | `01-en-tete.png`                   | Gabarit de l'étape 2 ; icônes et navigation pilotées par `routeFor()`                                                                                                                                                       | Conforme ; E5, E8 à E10                              |
| Hero                   | `02-hero.png`                      | Trois diapositives (ip18, gw9, rn15), dégradés, halo, anneau et flottement de la maquette ; points à barre de progression, flèches, bouton lecture/pause ; une colonne centrée sous 901 px (820 px de haut), 680 px au-delà | Conforme ; puce « Nouveau » retirée (§4.5, E3) ; E23 |
| Catégories             | `03-categories.png`                | Pastilles de 92 px (68 px sur mobile), pictogrammes de 34 px, centrées ; catégories vers `/boutique#…`, « Comparer » vers `/#comparer`                                                                                      | Conforme ; E24                                       |
| Tuiles promotionnelles | `04-tuiles.png`                    | Galaxy A57 en pleine largeur, puis AirPods 5, Galaxy Buds 4, Apple Watch Series 12, Redmi Watch 6 ; couleurs, surtitres et boutons de la maquette ; « Acheter » vers la fiche                                               | E16 (tuile iPhone) ; E20 (hauteurs)                  |
| Section épinglée       | `05-pin.png` (maquette seulement)  | Supprimée, son titre « iPhone, Galaxy ou Redmi ? » est repris par le comparateur                                                                                                                                            | E16, validé (D5)                                     |
| Nouveautés             | `06-nouveautes.png`                | Filtres de marque (`PillGroup`) et rail à flèches (`aria-disabled` aux extrémités, clavier, défilement d'une carte) ; cartes de 300 px, visuels de 220 px                                                                   | Conforme                                             |
| Univers de marque      | `07-marques.png`                   | Cartes de 520 px, textes et couleurs de la maquette ; visuels Apple Watch, Galaxy Buds, Redmi Watch ; lien vers `/boutique` (puis `/marques/[marque]` à l'étape 4)                                                          | E17, validé (D5)                                     |
| Comparateur            | `08-comparateur.png`               | Onglets de famille (Smartphones par défaut), vrai `<table>` de six lignes clés déclarées dans `lib/compare/rows.ts`, couleurs de marque, note de sélection ; « Voir le produit » vers la fiche                              | E19, validé (D5) ; E22                               |
| Quiz                   | `09-quiz.png` (maquette seulement) | `QuizTeaser` prêt (question 1, formulaire GET vers `/aide-au-choix`), absent de l'accueil jusqu'à l'étape 5 ; aperçu non soumis dans `/styleguide`                                                                          | E18, validé (D5)                                     |
| Réassurance            | `10-reassurance.png`               | Grille `.assur` de la maquette : 4, 2 puis 1 colonne, icônes de 48 px, textes de la maquette (paiement simulé)                                                                                                              | Conforme                                             |
| Pied de page           | `11-pied-de-page.png`              | Gabarit de l'étape 2                                                                                                                                                                                                        | Conforme ; E11 à E15                                 |

## Critères mesurés de l'étape 3

| Critère                                                   | Mesure (17 novembre 2026)                       | Test                                                              |
| --------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| Hauteur de `/` à 1440 px ≤ 6 000 px                       | 5 950 px                                        | `e2e/accueil.spec.ts`                                             |
| Aucun produit visible plus de 3 fois                      | 3 au plus, à l'état initial et après défilement | `e2e/accueil.spec.ts`                                             |
| JavaScript < 150 Ko compressé (`/` et une fiche)          | 151 231 octets (147,7 Ko) sur les deux pages    | `e2e/budget.spec.ts`, `docs/audits/budget.md`                     |
| Transfert total de `/` < 1 Mo (document compris)          | 514 287 octets                                  | `e2e/budget.spec.ts`                                              |
| Lighthouse mobile : Performance ≥ 90                      | 92                                              | `docs/audits/lighthouse-etape-3.md`                               |
| Lighthouse mobile : Accessibilité ≥ 95                    | 100                                             | idem                                                              |
| Lighthouse mobile : LCP < 2,5 s                           | **3,2 s : non tenu** (analyse dans le rapport)  | idem                                                              |
| Lighthouse mobile : CLS < 0,1                             | 0                                               | idem                                                              |
| Lighthouse mobile : TBT < 200 ms                          | 122 ms (81 à 122 ms sur trois exécutions)       | idem                                                              |
| Carrousel, rail, liens masqués, hydratation, 404 de fiche | verts                                           | `e2e/carrousel.spec.ts`, `accueil.spec.ts`, `hydratation.spec.ts` |
