"use client";

/** Bouton rond de 44 px du sélecteur de quantité. */
const stepClasses =
  "grid size-11 place-items-center rounded-full text-lg leading-none font-semibold text-ink transition-colors state-hover:bg-surface-hover aria-disabled:cursor-default aria-disabled:text-line-control aria-disabled:hover:bg-transparent";

/**
 * Sélecteur de quantité « − 2 + » (de 1 à `max`), groupe nommé « Quantité de … ». Aux bornes,
 * les boutons sont `aria-disabled` (jamais `disabled`) : celui qui a le focus le garde, et un
 * clic est ignoré. La nouvelle quantité est annoncée par le parent (région `status`).
 */
export function QuantityStepper({
  label,
  qty,
  max,
  onChange,
}: {
  /** Ce dont on règle la quantité : « iPhone 18 Pro (Bordeaux · 512 Go) ». */
  label: string;
  qty: number;
  max: number;
  onChange: (qty: number) => void;
}) {
  const atMin = qty <= 1;
  const atMax = qty >= max;
  return (
    <div
      role="group"
      aria-label={`Quantité de ${label}`}
      className="inline-flex items-center rounded-full border border-line-control"
    >
      <button
        type="button"
        className={stepClasses}
        aria-label={`Diminuer la quantité de ${label}`}
        aria-disabled={atMin ? true : undefined}
        onClick={() => {
          if (!atMin) onChange(qty - 1);
        }}
      >
        −
      </button>
      <span className="min-w-7 text-center font-semibold tabular-nums" data-testid="quantite">
        {qty}
      </span>
      <button
        type="button"
        className={stepClasses}
        aria-label={`Augmenter la quantité de ${label}`}
        aria-disabled={atMax ? true : undefined}
        onClick={() => {
          if (!atMax) onChange(qty + 1);
        }}
      >
        +
      </button>
    </div>
  );
}
