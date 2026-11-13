# Journal des modifications

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Une version par étape
du plan (`v0.N.0`), puis `v1.0.0`.

## [Non publié]

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
