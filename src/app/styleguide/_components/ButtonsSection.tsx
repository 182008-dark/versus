import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { BUTTON_VARIANTS, type ButtonVariant } from "@/components/ui/button-styles";
import { BRANDS, brandThemes } from "@/lib/brand-themes";
import { StyleguideSection } from "./StyleguideSection";

/** États montrés sans interaction : data-state force survol, focus et appui (globals.css). */
const states = [
  { label: "Par défaut", props: {} },
  { label: "Survol", props: { "data-state": "hover" } },
  { label: "Focus clavier", props: { "data-state": "focus" } },
  { label: "Appui", props: { "data-state": "active" } },
  { label: "Désactivé", props: { disabled: true } },
  { label: "Pressé (bascule)", props: { pressed: true } },
] as const;

const variantInfo: Record<ButtonVariant, { label: string; dark?: boolean }> = {
  primary: { label: "primary : action principale (accent)" },
  dark: { label: "dark : action sur fond clair" },
  light: { label: "light : action sur fond sombre", dark: true },
  outline: { label: "outline : secondaire, bascule (comparer)" },
  onDark: { label: "onDark : secondaire sur fond sombre", dark: true },
  brand: { label: "brand : couleurs de la marque ([data-brand])" },
};

function Row({ variant, brand }: { variant: ButtonVariant; brand?: (typeof BRANDS)[number] }) {
  const info = variantInfo[variant];
  return (
    <div
      data-tone={info.dark ? "dark" : undefined}
      data-brand={brand}
      className={clsx(
        "flex flex-wrap items-end gap-4 rounded-box p-5",
        info.dark ? "bg-surface-dark text-on-dark" : brand ? "bg-brand-ground" : "bg-surface-2",
      )}
    >
      {states.map((state) => (
        <figure key={state.label} className="flex flex-col items-start gap-2">
          {/* --muted n'atteint pas AA sur le fond Samsung (4,49:1) : encre de la marque. */}
          <figcaption
            className={clsx(
              "text-xs",
              info.dark ? "text-muted-on-dark" : brand ? "text-brand-ink" : "text-muted",
            )}
          >
            {state.label}
          </figcaption>
          <Button variant={variant} {...state.props}>
            {brand ? `Acheter (${brandThemes[brand].label})` : "Acheter"}
          </Button>
        </figure>
      ))}
    </div>
  );
}

export function ButtonsSection() {
  return (
    <StyleguideSection
      id="boutons"
      eyebrow="3. Boutons"
      title="Variantes, tailles et états"
      intro={
        <p>
          Hauteur de 44 px (<code>md</code>) ou 48 px (<code>lg</code>). Agrandissement de 4 % au
          survol, seulement sans mouvement réduit. Anneau de focus de 2 px en accent, vert clair sur
          fond sombre. Avec <code>href</code>, le bouton est un lien.
        </p>
      }
    >
      <div className="flex flex-col gap-8">
        {BUTTON_VARIANTS.filter((v) => v !== "brand").map((variant) => (
          <div key={variant}>
            <h3 className="mb-3 text-base font-bold">{variantInfo[variant].label}</h3>
            <Row variant={variant} />
          </div>
        ))}
        <div>
          <h3 className="mb-3 text-base font-bold">{variantInfo.brand.label}</h3>
          <div className="flex flex-col gap-3">
            {BRANDS.map((brand) => (
              <Row key={brand} variant="brand" brand={brand} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-base font-bold">Tailles</h3>
          <div className="flex flex-wrap items-center gap-4 rounded-box bg-surface-2 p-5">
            <Button size="md">Taille md (44 px)</Button>
            <Button size="lg">Taille lg (48 px)</Button>
            <Button href="/livraison" variant="dark" size="lg">
              Lien en bouton
            </Button>
          </div>
        </div>
      </div>
    </StyleguideSection>
  );
}
