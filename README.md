# VERSUS

> **Site fictif.** VERSUS est un projet pédagogique : aucune vente réelle, aucun paiement
> encaissé, aucun produit livré. Les prix sont indicatifs, en FCFA. Apple, Samsung et Xiaomi sont
> des marques de leurs propriétaires respectifs ; VERSUS n'est affilié à aucune d'elles.

VERSUS est une boutique en ligne **fictive** de smartphones, écouteurs et montres Apple, Samsung et
Xiaomi pour le Togo. Elle compare les trois marques côte à côte, aide à choisir et simule une
commande complète avec quatre paiements fictifs : T-Money, Flooz, carte et paiement à la livraison.

Le projet avance en 9 étapes, chacune mise en production, taguée (`v0.N.0`) et présentable en
5 minutes. Le plan complet est dans [`docs/PLAN.md`](docs/PLAN.md).

**En ligne : <https://versus-ecru.vercel.app>** (compte Vercel personnel, déploiement de production).

**État actuel : étape 2 (design system et gabarit global).** Tokens en trois couches et accent
vert VERSUS (contrastes mesurés), composants de base, gabarit complet (bandeau « fictif »,
en-tête, menu mobile, pied de page), pages d'information (mentions légales, crédits,
confidentialité, CGV, livraison, garantie), pages d'erreur et `/styleguide` (visible en local et
en preview, 404 en production). L'accueil reste la page provisoire « Bientôt en ligne » jusqu'à
l'étape 3.

## Stack

Next.js 16.4 (App Router, Turbopack, Cache Components), React 19.3, TypeScript 5.9, Tailwind CSS 4,
zod, Vitest, Playwright et axe. Hébergement Vercel (région `cdg1`). Supabase arrive à l'étape 4.
Détails et justifications : [`docs/decisions/001-stack.md`](docs/decisions/001-stack.md).

## Installation

Prérequis : Node 24 (voir `.nvmrc`) et npm 11.

```bash
git clone <url-du-depot> versus
cd versus
npm ci
npx playwright install chromium   # navigateur des tests e2e
cp .env.example .env.local        # facultatif en local
npm run dev                       # http://localhost:3000
```

Aucune variable n'est obligatoire en local : `NEXT_PUBLIC_SITE_URL` vaut par défaut
`http://localhost:3000` et `ALLOW_INDEXING` vaut `false`.

## Scripts

| Commande                          | Rôle                                                      |
| --------------------------------- | --------------------------------------------------------- |
| `npm run dev`                     | serveur de développement                                  |
| `npm run build` / `npm run start` | build et serveur de production                            |
| `npm run lint`                    | ESLint (`eslint .`)                                       |
| `npm run typecheck`               | `next typegen && tsc --noEmit`                            |
| `npm test`                        | tests unitaires Vitest (`src/**`, `scripts/**`)           |
| `npm run test:e2e`                | tests Playwright (build, puis `next start`)               |
| `npm run check:forbidden`         | motifs interdits et versions non exactes                  |
| `npm run capture:maquette`        | captures de la maquette (servie en HTTP sur le port 4000) |
| `npm run capture:gabarit`         | captures de l'implémentation (site lancé, `SITE_URL`)     |
| `npm run format`                  | Prettier                                                  |

## Variables d'environnement

Voir [`.env.example`](.env.example) et le §7.5 du plan. `NEXT_PUBLIC_SITE_URL` n'est obligatoire
qu'en production ; en preview, l'URL est calculée depuis `VERCEL_BRANCH_URL`. `.env.local` n'est
jamais commité.

## Documentation

- [`docs/PLAN.md`](docs/PLAN.md) : plan de projet de référence
- [`docs/decisions/`](docs/decisions/) : décisions d'architecture (ADR)
- [`docs/glossaire.md`](docs/glossaire.md) : correspondance français ↔ anglais
- [`docs/design-system.md`](docs/design-system.md) : tokens, points de rupture, composants
- [`docs/ecarts-maquette.md`](docs/ecarts-maquette.md) : registre des écarts à la maquette
- [`docs/maquette/`](docs/maquette/) : captures de la maquette validée et de l'implémentation
- `/styleguide` (local et preview) : vitrine du design system
- [`AGENTS.md`](AGENTS.md) : conventions de code
- [`CHANGELOG.md`](CHANGELOG.md) : historique des versions
