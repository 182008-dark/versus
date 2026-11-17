/** Durée minimale de vie d'un cache pour qu'une page reste prérendue (cacheLife, Next 16). */
export const MIN_CACHE_SECONDS = 300;

/**
 * Secondes avant le prochain minuit à Lomé. Africa/Lome est à UTC+0, sans heure d'été : minuit
 * à Lomé est minuit UTC. Sert à faire expirer « aujourd'hui » (badges « Nouveau ») au changement
 * de jour plutôt qu'au bout d'une heure arbitraire.
 */
export function secondsUntilLomeMidnight(now: Date): number {
  const elapsed = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
  return 86_400 - elapsed;
}

/**
 * Profil `cacheLife` de la date du jour : `revalidate` et `expire` tombent à minuit (au moins
 * 5 minutes, sans quoi la page ne serait plus prérendue). Sans fenêtre « stale-while-revalidate »,
 * la première requête après minuit attend la nouvelle page au lieu de recevoir celle de la veille.
 */
export function todayCacheProfile(now: Date) {
  const seconds = Math.max(secondsUntilLomeMidnight(now), MIN_CACHE_SECONDS);
  return { stale: MIN_CACHE_SECONDS, revalidate: seconds, expire: seconds };
}
