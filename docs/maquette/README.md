# Captures de la maquette

Captures de référence de la maquette validée (`Accueil VERSUS-html/Main.dc.html`), générées par
`scripts/capture-maquette.ts` (`npm run capture:maquette`, maquette servie en HTTP sur le port 4000).

- `captures/1440/` et `captures/390/` : une capture par section (`NN-section.png`) et la page entière
  (`pleine-page.png`).
- `captures/mesures.json` : hauteur totale de la page et boîte de chaque section.

## Hauteur de la maquette (13 novembre 2026)

| Largeur | Hauteur totale |
|---|---|
| 1440 px | 11 103 px |
| 390 px | 14 246 px |

À comparer au critère de l'accueil (hauteur de `/` à 1440 px ≤ 6 000 px, étapes 3 et 9).

## Captures de l'implémentation

`docs/maquette/implementation/{1440,390}/` : en-tête, pied de page, menu mobile et page entière de
`/mentions-legales`, produits par `npm run capture:gabarit` (site lancé, `SITE_URL`, défaut
`http://localhost:3000`). Comparaison et écarts : `docs/ecarts-maquette.md`.

## Conventions de capture

- Pas de `reducedMotion` (il masque le texte du hero dans la maquette).
- Le carrousel est mis en pause sur la première diapositive, après les animations d'entrée.
- Les apparitions au défilement (`.reveal`, `.zoom`, `.rise`) sont figées dans leur état final.
- La section épinglée « Smartphones » est capturée à 90 % de son défilement (bloc collant seul).
