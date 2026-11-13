/**
 * Pastille de compteur (maquette : `.count`), en accent VERSUS.
 * Visuelle seulement : le nombre est porté par le nom accessible de l'IconButton.
 * L'animation `bump` se rejoue quand le parent change la `key` de la pastille.
 */
export function CountBadge({ value }: { value: number }) {
  return (
    <span
      aria-hidden="true"
      className="anim-bump absolute top-1 right-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-accent px-[5px] text-[10.5px] leading-none font-bold text-on-accent"
    >
      {value > 99 ? "99+" : value}
    </span>
  );
}
