import { Logo } from "@/components/layout/Logo";
import { MainNav } from "@/components/layout/MainNav";
import { PaymentBadges } from "@/components/layout/PaymentBadges";
import { ScrollRegion } from "@/components/ui/ScrollRegion";
import { mainNavPreview, type NavGroup } from "@/config/site";
import { durations, radii, radiusAliases, responsiveScales } from "@/data/design-tokens";
import { BRANDS, brandThemes, heroStyle } from "@/lib/brand-themes";
import { StyleguideSection } from "./StyleguideSection";
import { TokensTable } from "./TokensTable";

/** Aperçu non cliquable : les liens n'existent qu'une fois leur route livrée. */
const previewGroups: NavGroup[] = mainNavPreview.map((group) => ({
  label: group.label,
  links: group.items.map((label) => ({ label, href: "" })),
}));

/** « 24px » → « 24 px » (espace insécable). */
const px = (value: string) => value.replace("px", "\u00A0px");

const radiusClasses = { tile: "rounded-tile", card: "rounded-card", control: "rounded-control" };
const radiusUsage = {
  tile: "tuiles, bandeau et cartes de marque",
  card: "cartes produit, encarts, comparateur",
  control: "zone photo, champs, menus",
};

export function LayoutSection() {
  return (
    <StyleguideSection
      id="gabarit"
      eyebrow="6. Gabarit"
      title="Arrondis, ombres, mouvement, espacements et grille"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-card bg-surface-2 p-6">
          <h3 className="text-base font-bold">Trois arrondis (et rounded-full)</h3>
          <ul className="mt-4 flex flex-wrap items-end gap-4">
            {(Object.keys(radii) as (keyof typeof radii)[]).map((name) => (
              <li key={name} className="max-w-32 text-xs">
                <span className={`block size-20 border border-line bg-bg ${radiusClasses[name]}`} />
                <span className="mt-2 block font-semibold">
                  {name} · {px(radii[name])}
                </span>
                <span className="text-muted">{radiusUsage[name]}</span>
              </li>
            ))}
            <li className="max-w-32 text-xs">
              <span className="block h-11 w-20 rounded-full border border-line bg-bg" />
              <span className="mt-2 block font-semibold">full</span>
              <span className="text-muted">boutons, pastilles, badges, VS</span>
            </li>
          </ul>
          <p className="mt-4 text-xs text-muted">
            Emboîtement : zone photo de 12 px + marge de 8 px = carte de 20 px. Alias temporaires :{" "}
            {Object.entries(radiusAliases)
              .map(([alias, target]) => `${alias} → ${target}`)
              .join(", ")}
            .
          </p>
          <div className="mt-4 rounded-card bg-bg p-2 shadow-card">
            <div className="grid h-20 place-items-center rounded-control bg-surface text-xs text-muted">
              Zone photo 12 px dans une carte 20 px
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="rounded-card bg-surface-2 p-6">
            <h3 className="text-base font-bold">Ombres</h3>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <span className="grid h-20 place-items-center rounded-card bg-bg shadow-card">
                shadow-card
              </span>
              <span className="grid h-20 place-items-center rounded-card bg-bg shadow-tray">
                shadow-tray
              </span>
            </div>
          </div>
          <div className="rounded-card bg-surface-2 p-6">
            <h3 className="text-base font-bold">Mouvement</h3>
            <TokensTable
              caption="Durées du mouvement"
              rows={[
                ["--dur-fast", durations["dur-fast"].replace("ms", " ms"), "clic, sortie"],
                ["--dur-base", durations["dur-base"].replace("ms", " ms"), "survol"],
                [
                  "--dur-slow",
                  durations["dur-slow"].replace("ms", " ms"),
                  "changement de diapositive",
                ],
                ["--ease-out", "cubic-bezier(0.2, 0.7, 0.2, 1)", "courbe unique"],
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-card bg-surface-2 p-6">
        <h3 className="text-base font-bold">Espacements et grille</h3>
        <TokensTable
          caption="Espacements"
          rows={[
            [
              "--space-section",
              `${px(responsiveScales["space-section"].base)} / ${px(responsiveScales["space-section"][901])} dès 901 px`,
              "seul espacement entre sections (py-section)",
            ],
            [
              "--gutter",
              `${px(responsiveScales.gutter.base)} / ${px(responsiveScales.gutter[641])} dès 641 px`,
              "marge latérale de wrap (px-gutter)",
            ],
            ["grid-page", "4 / 6 / 12 colonnes", "gouttière 16 px, 24 px dès 1240 px"],
            ["grid-products", "liste / 2 / 3 / 4", "sous 400 px, dès 400, 901 et 1240 px"],
          ]}
        />
        <div className="mt-4 grid-page" aria-hidden="true">
          {Array.from({ length: 12 }, (_, index) => (
            <span
              key={index}
              className="h-10 rounded-control bg-accent-soft max-md:nth-[n+7]:hidden max-sm:nth-[n+5]:hidden"
            />
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-card bg-surface-2 p-6">
          <h3 className="text-base font-bold">Logo, focus et paiements</h3>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <Logo />
            <span data-state="focus" className="rounded-control bg-bg px-4 py-2 text-sm">
              Focus sur fond clair
            </span>
            <span data-tone="dark" className="rounded-control bg-surface-dark p-3">
              <span data-state="focus" className="rounded-control px-3 py-1 text-sm text-on-dark">
                Focus sur fond sombre
              </span>
            </span>
          </div>
          <div className="mt-4">
            <PaymentBadges />
          </div>
        </div>
        <div className="rounded-card bg-surface-2 p-6">
          <h3 className="text-base font-bold">Dégradés du hero (refaits au lot 4)</h3>
          <ul className="mt-4 grid grid-cols-3 gap-3">
            {BRANDS.map((brand) => (
              <li key={brand} className="text-xs">
                <span
                  className="block h-16 rounded-control bg-[radial-gradient(120%_100%_at_75%_55%,var(--hero-from)_0%,var(--hero-via)_45%,var(--hero-to)_85%)]"
                  style={heroStyle(brand)}
                />
                <span className="mt-1 block">{brandThemes[brand].label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-card bg-surface-2 p-6">
        <h3 className="text-base font-bold">Navigation principale complète (aperçu, ≥ 901 px)</h3>
        <p className="mt-1 text-sm text-muted">
          Dans l&apos;en-tête réel, chaque lien n&apos;apparaît qu&apos;une fois sa page livrée.
        </p>
        <div className="mt-4 flex h-14 items-center rounded-control bg-header-bg px-6">
          <MainNav groups={previewGroups} preview />
        </div>
      </div>

      <div className="mt-6 rounded-card bg-surface-2 p-6">
        <h3 className="text-base font-bold">Points de rupture (mobile d&apos;abord)</h3>
        <ScrollRegion label="Points de rupture" className="mt-1">
          <TokensTable
            caption="Points de rupture"
            rows={[
              ["base", "< 400 px", "grilles de produits en liste"],
              ["400 px", "≥ 400 px", "grilles de produits sur 2 colonnes"],
              ["sm", "≥ 641 px", "typographie intermédiaire, gouttière de 24 px, grille de 6"],
              ["md", "≥ 901 px", "navigation complète, sections de 96 px, grille de 12"],
              ["lg", "≥ 1025 px", "grands titres (hero 76 px), pied de page 1,6 + 3 colonnes"],
              ["xl", "≥ 1240 px", "4 cartes produit par rangée, gouttière de 24 px"],
            ]}
          />
        </ScrollRegion>
      </div>
    </StyleguideSection>
  );
}
