## Objet

<!-- Étape concernée (ex. « Étape 2 : design system ») et résumé en deux ou trois lignes. -->

## Définition de « fini » (§3.4 du plan)

- [ ] `npm run lint`, `npm run typecheck` (`next typegen && tsc --noEmit`), `npm test`, `npm run check:forbidden` et `npm run test:e2e` sont verts
- [ ] Preview vérifiée à 375 px et à 1440 px
- [ ] `e2e/liens.spec.ts` vert (liens, `action` de formulaires, ancres `#id`)
- [ ] axe sans violation « serious » ni « critical » sur les pages touchées
- [ ] Budgets respectés (`e2e/budget.spec.ts`, dès l'étape 3) : JS < 150 Ko compressé sur `/` et une fiche, `/` < 1 Mo transféré
- [ ] Documentation à jour (README, ADR, `docs/`, `CHANGELOG.md`)
- [ ] Captures dans `docs/fidelite-maquette.md` si l'interface a changé
- [ ] Critères d'acceptation de l'étape cochés
- [ ] Aucun secret dans le code ; migrations appliquées sur `versus-dev` (dès l'étape 4)

## Captures

<!-- Avant / après si l'interface a changé. -->
