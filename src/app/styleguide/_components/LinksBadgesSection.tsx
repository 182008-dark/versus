import clsx from "clsx";
import { BRANDS, brandThemes } from "@/lib/brand-themes";
import { Badge } from "@/components/ui/Badge";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { IconButton } from "@/components/ui/IconButton";
import { NewBadge } from "@/components/ui/NewBadge";
import { TextLink } from "@/components/ui/TextLink";
import { DialogDemo } from "./DialogDemo";
import { StyleguideSection } from "./StyleguideSection";

const linkStates = [
  { label: "Par défaut", state: undefined },
  { label: "Survol", state: "hover" },
  { label: "Focus clavier", state: "focus" },
] as const;

const linkTones = [
  { tone: "accent", label: "accent (fond blanc)", dark: false, gray: false },
  { tone: "accentInk", label: "accentInk (surface grise : vert foncé)", dark: false, gray: true },
  { tone: "ink", label: "ink", dark: false, gray: false },
  { tone: "light", label: "light (fond sombre)", dark: true, gray: false },
  { tone: "accentOnDark", label: "accentOnDark (fond sombre)", dark: true, gray: false },
] as const;

export function LinksBadgesSection() {
  return (
    <StyleguideSection
      id="liens-badges"
      eyebrow="4. Liens, badges, icônes"
      title="Liens fléchés, badges et boîte de dialogue"
      intro={
        <p>
          Les liens fléchés utilisent « → » (au lieu du « › » de la maquette) ; la flèche se décale
          au survol et au focus clavier.
        </p>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        {linkTones.map(({ tone, label, dark, gray }) => (
          <div
            key={tone}
            data-tone={dark ? "dark" : undefined}
            className={clsx(
              "rounded-card p-5",
              dark
                ? "bg-surface-dark text-on-dark"
                : gray
                  ? "bg-surface"
                  : "bg-bg ring-1 ring-line-soft",
            )}
          >
            <h3 className="text-sm font-bold">TextLink {label}</h3>
            <div className="mt-2 flex flex-wrap gap-x-6">
              {linkStates.map(({ label: stateLabel, state }) => (
                <TextLink key={stateLabel} href="/garantie" tone={tone} arrow data-state={state}>
                  {stateLabel}
                </TextLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="text-base font-bold">Badges</h3>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <NewBadge />
            <Badge tone="neutral">En stock</Badge>
            <Badge tone="muted">Épuisé</Badge>
            {BRANDS.map((brand) => (
              <span key={brand} data-brand={brand}>
                <Badge tone="brand">{brandThemes[brand].label}</Badge>
              </span>
            ))}
            <span data-tone="dark" className="rounded-full bg-surface-dark p-2">
              <Badge tone="onDark">Nouveau</Badge>
            </span>
          </div>
        </div>
        <div>
          <h3 className="text-base font-bold">Surtitres (alias temporaire)</h3>
          <p className="mt-1 text-sm text-muted">
            Plus de petites capitales : casse normale, remplacé par la pastille de marque aux lots 3
            à 5.
          </p>
          <Eyebrow className="mt-3">Univers de marque</Eyebrow>
          <div className="mt-3 rounded-card bg-surface-dark p-4">
            <Eyebrow tone="dark">Aide au choix</Eyebrow>
          </div>
        </div>
        <div>
          <h3 className="text-base font-bold">Icônes et compteur</h3>
          <div className="mt-3 flex items-center gap-1">
            <IconButton label="Rechercher" icon="search" />
            <IconButton
              label="Comparateur"
              icon="compare"
              count={2}
              countUnits={["produit", "produits"]}
            />
            <IconButton label="Mon compte" icon="account" />
            <IconButton label="Panier" icon="cart" count={3} />
          </div>
          <p className="mt-2 text-xs text-muted">
            Démonstration : dans l&apos;en-tête, ces icônes restent masquées tant que leur page
            n&apos;existe pas.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-base font-bold">Boîte de dialogue</h3>
        <p className="mt-1 text-sm text-muted">
          &lt;dialog&gt; natif : Échap ferme, focus piégé puis rendu au bouton.
        </p>
        <div className="mt-3">
          <DialogDemo />
        </div>
      </div>
    </StyleguideSection>
  );
}
