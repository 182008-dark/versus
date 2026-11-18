/**
 * Écran d'attente d'une page marque (§3.2 du plan de refonte) : formes grises fixes, **sans
 * animation**, aux proportions du bandeau et de la grille, et un message lu par les lecteurs
 * d'écran. Les pages marque sont prérendues : il ne s'affiche que le temps d'une navigation lente.
 */
export default function BrandLoading() {
  return (
    <div className="wrap w-full pt-2 pb-section">
      <p role="status" className="flex min-h-11 items-center text-sm text-muted-strong">
        Chargement de la marque…
      </p>
      <div aria-hidden="true">
        <div className="h-[420px] rounded-tile bg-surface lg:h-[380px]" />
        <div className="mt-8 flex gap-2 py-3">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="h-11 w-28 rounded-full bg-surface" />
          ))}
        </div>
        <div className="mt-10 grid-products">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="h-[160px] rounded-card bg-surface min-[400px]:h-[470px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
