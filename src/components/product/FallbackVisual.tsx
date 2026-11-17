import { fallbackAccent, fallbackVisuals, type Brand, type DeviceKind } from "@/lib/brand-themes";

/**
 * Silhouette SVG d'un produit sans image (§4.3 : SVG de secours de ProductVisual, d'après
 * Device.dc.html). Couleurs lues dans `brand-themes.ts` : aucune couleur en dur ici. Sans
 * dégradé, donc sans identifiant à rendre unique.
 */
export function FallbackVisual({
  kind,
  brand,
  label,
}: {
  kind: DeviceKind;
  brand: Brand;
  /** Nom accessible ; chaîne vide pour un visuel décoratif. */
  label: string;
}) {
  const accent = fallbackAccent[brand];
  const { screen, lens, sheenLight } = fallbackVisuals;
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };

  return (
    <svg viewBox="0 0 200 240" className="h-full w-full" {...a11y}>
      {kind === "phone" ? (
        <>
          <rect x="55" y="10" width="90" height="220" rx="18" fill={accent} />
          <rect x="61" y="16" width="78" height="208" rx="13" fill={screen} />
          <circle cx="100" cy="28" r="4" fill={lens} />
        </>
      ) : kind === "buds" ? (
        <>
          <rect
            x="50"
            y="70"
            width="100"
            height="110"
            rx="34"
            fill={sheenLight}
            stroke={accent}
            strokeWidth="4"
          />
          <line x1="50" y1="112" x2="150" y2="112" stroke={accent} strokeWidth="3" />
        </>
      ) : kind === "band" ? (
        <>
          <rect x="88" y="10" width="24" height="220" rx="12" fill={accent} />
          <rect x="84" y="80" width="32" height="80" rx="12" fill={screen} />
        </>
      ) : (
        <>
          <rect x="78" y="10" width="44" height="220" rx="16" fill={accent} />
          {kind === "round" ? (
            <circle cx="100" cy="120" r="56" fill={screen} stroke={accent} strokeWidth="8" />
          ) : (
            <rect
              x="48"
              y="66"
              width="104"
              height="108"
              rx="28"
              fill={screen}
              stroke={accent}
              strokeWidth="8"
            />
          )}
        </>
      )}
    </svg>
  );
}
