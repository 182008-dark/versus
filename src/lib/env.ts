import { z } from "zod";

/**
 * Variables d'environnement publiques, validées par zod (§7.5 du plan).
 *
 * `siteUrl` n'est lu que côté serveur (metadataBase, redirections, e-mails) :
 * c'est là que `VERCEL_ENV` et `VERCEL_BRANCH_URL` sont disponibles.
 * Les variables serveur (clés Supabase, secrets) iront dans `env.server.ts`
 * (avec `import "server-only"`) à partir de l'étape 4.
 */

/** Une variable vide (`NOM=` dans un fichier .env) équivaut à une variable absente. */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

export const envSchema = z
  .object({
    NEXT_PUBLIC_SITE_URL: optional(z.url({ protocol: /^https?$/ })),
    ALLOW_INDEXING: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.enum(["true", "false"]).default("false"),
    ),
    VERCEL_ENV: optional(z.enum(["production", "preview", "development"])),
    VERCEL_BRANCH_URL: optional(z.string()),
  })
  .superRefine((env, ctx) => {
    if (env.VERCEL_ENV === "production" && !env.NEXT_PUBLIC_SITE_URL) {
      ctx.addIssue({
        code: "custom",
        path: ["NEXT_PUBLIC_SITE_URL"],
        message: "NEXT_PUBLIC_SITE_URL est obligatoire en production.",
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

/** Valide un ensemble de variables et échoue tôt, avec un message lisible. */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Variables d'environnement invalides :\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

/** URL absolue du site, sans barre oblique finale. */
export function computeSiteUrl(env: Env): string {
  if (env.NEXT_PUBLIC_SITE_URL) return env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  if (env.VERCEL_ENV === "preview" && env.VERCEL_BRANCH_URL) {
    return `https://${env.VERCEL_BRANCH_URL}`;
  }
  return "http://localhost:3000";
}

/**
 * /styleguide est visible en local, en preview Vercel et sous `next start` (tests e2e), mais
 * renvoie 404 en production.
 *
 * On teste `VERCEL_ENV` et non `NODE_ENV` : `NODE_ENV` vaut "production" pour tout build
 * (`next build`, `next start`, previews Vercel), il ne distingue donc pas la production.
 */
export function isStyleguideEnabled(source: Pick<Env, "VERCEL_ENV">): boolean {
  return source.VERCEL_ENV !== "production";
}

// Accès explicites : Next.js n'injecte les variables NEXT_PUBLIC_* que sous cette forme.
export const env = parseEnv({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  ALLOW_INDEXING: process.env.ALLOW_INDEXING,
  VERCEL_ENV: process.env.VERCEL_ENV,
  VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
});

export const siteUrl = computeSiteUrl(env);

/** L'indexation n'est autorisée que si ALLOW_INDEXING vaut exactement "true". */
export const allowIndexing = env.ALLOW_INDEXING === "true";

export const styleguideEnabled = isStyleguideEnabled(env);
