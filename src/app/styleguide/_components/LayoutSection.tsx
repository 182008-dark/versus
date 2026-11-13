import { Logo } from "@/components/layout/Logo";
import { MainNav } from "@/components/layout/MainNav";
import { PaymentBadges } from "@/components/layout/PaymentBadges";
import { mainNavPreview, type NavGroup } from "@/config/site";
import { BRANDS, brandThemes, heroStyle } from "@/lib/brand-themes";
import { ScrollRegion } from "@/components/ui/ScrollRegion";
import { StyleguideSection } from "./StyleguideSection";

/** Aperçu non cliquable : les liens n'existent qu'une fois leur route livrée. */
const previewGroups: NavGroup[] = mainNavPreview.map((group) => ({
  label: group.label,
  links: group.items.map((label) => ({ label, href: "" })),
}));

const breakpoints = [
  {
    maquette: "> 1024 px (défaut)",
    versus: "lg : ≥ 1025 px",
    effet: "Hero 88 px, pied de page 1,6 + 3 colonnes",
  },
  {
    maquette: "≤ 1024 px",
    versus: "md : 901 à 1024 px",
    effet: "Pied de page 2 colonnes, hero 64 px",
  },
  {
    maquette: "≤ 900 px",
    versus: "base et sm : ≤ 900 px",
    effet: "Navigation masquée, menu mobile",
  },
  {
    maquette: "≤ 640 px",
    versus: "base : ≤ 640 px",
    effet: "Typographie mobile, sections 76 px, 1 colonne",
  },
];

const radii = [
  ["tile", "rounded-tile", "30 px"],
  ["box", "rounded-box", "28 px"],
  ["card", "rounded-card", "26 px"],
  ["result", "rounded-result", "18 px"],
  ["option", "rounded-option", "16 px"],
  ["icon", "rounded-icon", "14 px"],
  ["chip", "rounded-chip", "8 px"],
] as const;

export function LayoutSection() {
  return (
    <StyleguideSection
      id="gabarit"
      eyebrow="5. Gabarit et marques"
      title="Logo, navigation, focus, thèmes et mise en page"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-box bg-surface-2 p-6">
          <h3 className="text-base font-bold">Logo (monogramme « V/S »)</h3>
          <div className="mt-4 flex flex-wrap items-center gap-4 sm:gap-8">
            <Logo />
            <span className="rounded-chip bg-surface p-3">
              <Logo />
            </span>
          </div>
        </div>
        <div className="rounded-box bg-surface p-6">
          <h3 className="text-base font-bold">Moyens de paiement (simulés)</h3>
          <PaymentBadges />
        </div>
      </div>

      <div className="mt-6 rounded-box bg-surface-2 p-6">
        <h3 className="text-base font-bold">Navigation principale complète (aperçu, ≥ 901 px)</h3>
        <p className="mt-1 text-sm text-muted">
          Disposition de la maquette. Dans l&apos;en-tête réel, chaque lien n&apos;apparaît
          qu&apos;une fois sa page livrée.
        </p>
        <div className="mt-4 flex h-14 items-center rounded-chip bg-header-bg px-6">
          <MainNav groups={previewGroups} preview />
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-box bg-surface-2 p-6">
          <h3 className="text-base font-bold">Anneau de focus (2 px, décalé de 2 px)</h3>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <span data-state="focus" className="rounded-chip bg-bg px-4 py-2 text-sm">
              Sur fond clair
            </span>
            <span data-tone="dark" className="rounded-chip bg-surface-dark p-3">
              <span data-state="focus" className="rounded-chip px-3 py-1 text-sm text-on-dark">
                Sur fond sombre
              </span>
            </span>
          </div>
        </div>
        <div className="rounded-box bg-surface-2 p-6">
          <h3 className="text-base font-bold">Rayons</h3>
          <ul className="mt-4 flex flex-wrap gap-3">
            {radii.map(([name, cls, value]) => (
              <li key={name} className="text-center text-xs">
                <span className={`block size-14 border border-line bg-bg ${cls}`} />
                {name} · {value}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h3 className="mt-10 text-xl font-bold">Thèmes de marque et dégradés du hero</h3>
      <ul className="mt-4 grid gap-4 md:grid-cols-3">
        {BRANDS.map((brand) => (
          <li
            key={brand}
            data-brand={brand}
            className="overflow-hidden rounded-box bg-brand-ground"
          >
            <div
              className="h-28 bg-[radial-gradient(120%_100%_at_75%_55%,var(--hero-from)_0%,var(--hero-via)_45%,var(--hero-to)_85%)]"
              style={heroStyle(brand)}
            />
            <p className="p-4 text-sm font-bold text-brand-ink">
              {brandThemes[brand].label} · fond {brandThemes[brand].ground}
            </p>
          </li>
        ))}
      </ul>

      <h3 className="mt-10 text-xl font-bold">
        Points de rupture : maquette → mobile d&apos;abord
      </h3>
      <ScrollRegion label="Correspondance des points de rupture" className="mt-4">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <caption className="sr-only">Correspondance des points de rupture</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="py-2 pr-4 font-semibold">
                Maquette (max-width)
              </th>
              <th scope="col" className="py-2 pr-4 font-semibold">
                VERSUS (min-width)
              </th>
              <th scope="col" className="py-2 font-semibold">
                Effet
              </th>
            </tr>
          </thead>
          <tbody>
            {breakpoints.map((bp) => (
              <tr key={bp.maquette} className="border-b border-line-soft">
                <th scope="row" className="py-2 pr-4 font-normal">
                  {bp.maquette}
                </th>
                <td className="py-2 pr-4">{bp.versus}</td>
                <td className="py-2">{bp.effet}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollRegion>
    </StyleguideSection>
  );
}
