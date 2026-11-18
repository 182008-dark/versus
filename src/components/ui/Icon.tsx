import clsx from "clsx";

/** Tracés repris de la maquette (en-tête, hero, catégories, réassurance), plus le menu et la croix. */
const paths = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.6-3.6" />
    </>
  ),
  compare: (
    <>
      <rect x="3" y="4" width="7" height="16" rx="2" />
      <rect x="14" y="4" width="7" height="16" rx="2" />
    </>
  ),
  account: (
    <>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4" />
    </>
  ),
  cart: (
    <>
      <path d="M5.5 8h13l-1.1 12.1a1 1 0 0 1-1 .9H7.6a1 1 0 0 1-1-.9L5.5 8z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </>
  ),
  menu: <path d="M4 8h16M4 16h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  smartphone: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </>
  ),
  buds: (
    <>
      <circle cx="8" cy="7.5" r="3" />
      <path d="M8 10.5V19M8 15h2" />
      <circle cx="16" cy="7.5" r="3" />
      <path d="M16 10.5V19M16 15h-2" />
    </>
  ),
  watch: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="3.5" />
      <path d="M9 6V2.5h6V6M9 18v3.5h6V18" />
    </>
  ),
  band: (
    <>
      <rect x="9" y="5" width="6" height="14" rx="3" />
      <path d="M10.5 2v3M13.5 2v3M10.5 19v3M13.5 19v3" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6" />
      <path d="M12 17h.01" />
    </>
  ),
  chevronLeft: <path d="M15 5l-7 7 7 7" />,
  chevronRight: <path d="M9 5l7 7-7 7" />,
  mobileMoney: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M10 7h4M9.5 12.5l2 2 3.5-3.5" />
    </>
  ),
  cash: (
    <>
      <rect x="2.5" y="6.5" width="19" height="11" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 9.5v5M18 9.5v5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  truck: (
    <>
      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </>
  ),
} as const;

/** Tailles (maquette) : 16 px (commandes du hero), 19 px (en-tête), 24 px (réassurance), 34 px (catégories). */
const sizes = { 16: "size-4", 19: "size-[19px]", 24: "size-6", 34: "size-[34px]" } as const;
/** Épaisseurs du trait de la maquette. */
const strokes = {
  1.5: "stroke-[1.5]",
  1.6: "stroke-[1.6]",
  1.7: "stroke-[1.7]",
  2: "stroke-2",
} as const;

export type IconName = keyof typeof paths;

/** Icône au trait (19 px, trait de 1,7 px par défaut), décorative : le nom accessible est sur le bouton. */
export function Icon({
  name,
  size = 19,
  stroke = 1.7,
  className,
}: {
  name: IconName;
  size?: keyof typeof sizes;
  stroke?: keyof typeof strokes;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={clsx(
        "fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round]",
        sizes[size],
        strokes[stroke],
        className,
      )}
    >
      {paths[name]}
    </svg>
  );
}
