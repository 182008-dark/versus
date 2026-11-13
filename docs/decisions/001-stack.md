# ADR 001 : stack technique et outillage

- **Statut** : accepté
- **Date** : 13 novembre 2026 (étape 1)
- **Référence** : `docs/PLAN.md`, §2 et étape 1

## Contexte

VERSUS est une boutique fictive (projet pédagogique). Il faut une stack moderne, déployable dès le
premier jour, que l'on peut expliquer en soutenance, avec des versions reproductibles.

## Décision

| Domaine           | Choix                                                                | Version figée                                                                                 |
| ----------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Runtime           | Node                                                                 | 24.x (`.nvmrc` = `24`, `engines.node` = `24.x`)                                               |
| Framework         | Next.js App Router, Turbopack, Cache Components, Partial Prefetching | `next@16.4.6`                                                                                 |
| UI                | React, React DOM                                                     | `19.3.1`                                                                                      |
| Langage           | TypeScript `strict` et `noUncheckedIndexedAccess`                    | `5.9.3`                                                                                       |
| Lint              | ESLint (flat config) et `eslint-config-next` (jsx-a11y inclus)       | `eslint@9.39.5`, `eslint-config-next@16.4.6`                                                  |
| Styles            | Tailwind CSS v4 via le loader Turbopack                              | `tailwindcss@4.3.5`, `@tailwindcss/turbopack@4.3.5`                                           |
| Polices           | `next/font/google` : Inter et Plus Jakarta Sans                      | —                                                                                             |
| Validation        | zod                                                                  | `4.6.7`                                                                                       |
| Utilitaires       | `clsx`, `server-only`                                                | `2.1.1`, `0.0.1`                                                                              |
| Scripts TS        | tsx                                                                  | `4.23.15`                                                                                     |
| Tests unitaires   | Vitest, Testing Library, jsdom, `@vitejs/plugin-react`               | `vitest@5.1.0`, `@testing-library/react@16.3.3`, `jsdom@31.0.0`, `@vitejs/plugin-react@6.3.0` |
| Tests e2e et a11y | Playwright, `@axe-core/playwright`                                   | `@playwright/test@1.65.0`, `@axe-core/playwright@4.14.0`                                      |
| Format            | Prettier et `prettier-plugin-tailwindcss`                            | `3.10.1`, `0.8.1`                                                                             |
| Hébergement       | Vercel, fonctions en `cdg1` (`vercel.json`)                          | —                                                                                             |

Supabase (`@supabase/supabase-js`, `@supabase/ssr`, CLI) n'est installé qu'à l'étape 4.

### Versions figées

- create-next-app écrit des plages (`^19`, `^9`…) : chaque plage a été remplacée par la version
  réellement installée, puis le lockfile a été régénéré.
- `.npmrc` contient `save-exact=true` ; `package-lock.json` est commité ; la CI installe avec `npm ci`.
- `npm run check:forbidden` refuse toute version non exacte dans `package.json`.

### TypeScript 5.9.3 et non 7

`npm view typescript version` renvoie `7.0.2`, mais `typescript-eslint@8.72.2` (utilisé par
`eslint-config-next`) déclare `typescript: ">=4.8.4 <6.1.0"` en peerDependency. On reste donc en
5.9.3 (version proposée par create-next-app et par le plan).

### Agent feedback désactivé

`create-next-app@16.4.6 --help` liste `--no-agent-feedback` : le projet a été créé avec ce drapeau.
`next.config.ts` ne contient donc pas `experimental.agentFeedback`, dont la valeur par défaut est
`false` (documentation `node_modules/next/dist/docs/.../agentFeedback.md`). `AGENTS.md` a été généré
(`--agents-md`).

## Écarts au plan et justification

- **Tailwind via `@tailwindcss/turbopack`** (et non `@tailwindcss/postcss`) : c'est le gabarit
  officiel de create-next-app 16.4.6 (règle `turbopack.rules["*.css"]` dans `next.config.ts`,
  aucun `postcss.config.mjs`). On garde le gabarit officiel.
- **`vite-tsconfig-paths` retiré** : Vite 8 (embarqué par Vitest 5.1) résout nativement l'alias
  `@/*` avec `resolve.tsconfigPaths: true` et affiche un avertissement si le plugin est présent.
- **`eslint@9.39.5`** : version installée par create-next-app (le plan prévoyait 9.39.x). ESLint 10
  existe, mais n'est pas adopté à l'étape 1 pour rester sur la configuration testée par Next.
- **React 19.3.1** : create-next-app a installé 19.3.0 ; la 19.3.1 (correctif) est figée.
- **`@types/node` 24** au lieu du 20 proposé par create-next-app, pour correspondre au runtime.
- **Actions GitHub** : `actions/checkout@v7`, `actions/setup-node@v7`, `actions/upload-artifact@v7`
  (versions courantes, runtime `node24`), au lieu des `@v4` du plan.
- **Critère « aucun secret Supabase »** : le plan demandait `git grep -n "sb_secret"` vide, ce qui
  contredit la copie obligatoire du plan dans `docs/PLAN.md` (il mentionne le préfixe `sb_secret_`).
  Le critère devient `git grep -nE "sb_secret_[A-Za-z0-9]"` vide : une vraie clé est refusée, une
  mention du préfixe dans la documentation est permise. Corrigé dans le plan de référence et dans
  sa copie.

## Écartés volontairement

- shadcn/ui, qui éloignerait l'interface de la maquette ;
- framer-motion : les animations sont en CSS ;
- Zustand : un `useReducer` dans un contexte est plus pédagogique ;
- Prisma et Drizzle, qui masqueraient RLS et les RPC ;
- React Compiler (non activé à la création) ;
- Supabase Branching (payant) et les transformations d'images Supabase (plan Pro).

## Conséquences

- Toute nouvelle dépendance est ajoutée en version exacte, avec une justification dans un ADR.
- Une montée de version (TypeScript 7, ESLint 10…) fait l'objet d'une PR dédiée.
