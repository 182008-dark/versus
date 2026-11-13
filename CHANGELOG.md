# Journal des modifications

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Une version par étape
du plan (`v0.N.0`), puis `v1.0.0`.

## [Non publié]

## [0.1.0] : étape 1, socle (en cours)

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
