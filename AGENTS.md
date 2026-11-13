<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Conventions du projet VERSUS

Référence : `docs/PLAN.md` (§1.2 principes, §3.4 conventions, §7 qualité). En cas de doute, le plan
fait foi ; tout écart est noté dans un ADR (`docs/decisions/`).

## Nature du site

- Boutique **fictive** (projet pédagogique) : bandeau « Projet pédagogique » visible partout,
  `noindex`, aucun champ de carte ni code PIN, pas de JSON-LD `Product`/`Offer`.
- Un lien n'apparaît que si sa page existe : passer par `routeFor()` de `src/config/site.ts`, qui
  renvoie `null` pour une route non livrée. Jamais de `href="#"`.

## Langues

- Interface, URL, commentaires, documentation et messages de commit en **français**.
- Identifiants de code et de base en anglais (`camelCase` en TS, `snake_case` en SQL) ; la
  correspondance est dans `docs/glossaire.md`.

## Fichiers

- Composants en `PascalCase.tsx`, un export par fichier, environ 150 lignes au plus.
- Modules en `kebab-case.ts`. Tests unitaires à côté du code (`fcfa.test.ts`), e2e dans `e2e/`.
- Tout module serveur commence par `import "server-only"`.
- Server Actions dans `src/server/actions/*.ts` avec `"use server"`.
- Composants serveur par défaut ; `"use client"` seulement pour les îlots listés dans le plan.

## Landmarks

- Le layout racine n'a aucun landmark (html, body, polices, SkipLink).
- Chaque gabarit de groupe place `<main id="contenu">` ; les pages hors groupe (`not-found.tsx`…)
  déclarent le leur.

## Données, montants, dates

- Montants : entiers en FCFA (suffixe `_fcfa`), affichés uniquement avec `formatFCFA()`.
- Dates : `Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Lome' })` ; « aujourd'hui » passe par
  `getToday()` (injectable par `VS_TODAY`).
- Variables d'environnement : validées par zod dans `src/lib/env.ts` (et `env.server.ts` dès
  l'étape 4). Aucun secret dans le code ni dans une variable `NEXT_PUBLIC_*`.

## Couleurs

- Pas de littéral hexadécimal hors de la liste blanche (`src/data/**`, `src/lib/brand-themes.ts`,
  `src/app/globals.css`, `**/*.svg`, `**/opengraph-image.tsx`) ; utiliser les tokens.
- Les bleus Apple `#0071E3`, `#0066CC` et `#2997FF` sont interdits partout.

## Dépendances

- Versions exactes uniquement (`.npmrc` : `save-exact=true`), `npm ci` en CI.
- TypeScript reste en 5.x tant que `typescript-eslint` l'exige.
- Toute nouvelle dépendance est justifiée dans un ADR.

## Avant de pousser

```bash
npm run lint && npm run typecheck && npm test && npm run check:forbidden && npm run test:e2e
```

## Git

- Branche `main` toujours déployable ; une branche par étape (`etape-2-design-system`).
- Commits conventionnels en français (`feat(panier): ajouter le tiroir mini-panier`).
