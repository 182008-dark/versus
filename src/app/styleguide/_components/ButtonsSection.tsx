import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import {
  BUTTON_VARIANTS,
  LEGACY_BUTTON_VARIANTS,
  type ButtonVariant,
} from "@/components/ui/button-styles";
import { StyleguideSection } from "./StyleguideSection";

/** États montrés sans interaction : data-state force survol, focus et appui (globals.css). */
const states = [
  { label: "Par défaut", props: {} },
  { label: "Survol", props: { "data-state": "hover" } },
  { label: "Focus clavier", props: { "data-state": "focus" } },
  { label: "Appui (enfoncé)", props: { "data-state": "active" } },
  { label: "Désactivé", props: { disabled: true } },
] as const;

const rows: { variant: ButtonVariant; label: string; dark?: boolean; pressed?: boolean }[] = [
  { variant: "primary", label: "primary : l'action principale, toujours verte" },
  { variant: "primary", label: "primary sur fond sombre : toujours verte", dark: true },
  { variant: "secondary", label: "secondary : contour, et bascule (comparer)", pressed: true },
  { variant: "onDark", label: "onDark : secondaire sur fond sombre", dark: true, pressed: true },
];

function Row({
  variant,
  dark,
  pressed,
}: {
  variant: ButtonVariant;
  dark?: boolean;
  pressed?: boolean;
}) {
  const list = pressed
    ? [...states, { label: "Pressé (bascule)", props: { pressed: true } }]
    : states;
  return (
    <div
      data-tone={dark ? "dark" : undefined}
      className={clsx(
        "flex flex-wrap items-end gap-4 rounded-card p-5",
        dark ? "bg-surface-dark text-on-dark" : "bg-surface-2",
      )}
    >
      {list.map((state) => (
        <figure key={state.label} className="flex flex-col items-start gap-2">
          <figcaption className={clsx("text-xs", dark ? "text-muted-on-dark" : "text-muted")}>
            {state.label}
          </figcaption>
          <Button variant={variant} {...state.props}>
            Voir le produit
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
      title="Trois variantes, deux tailles"
      intro={
        <p>
          Une seule couleur d&apos;action, le vert VERSUS, y compris sur fond sombre. Pas
          d&apos;agrandissement au survol ; léger enfoncement (<code>scale(.97)</code>) à
          l&apos;appui, seulement sans mouvement réduit. Hauteur de 44 px (<code>md</code>) ou 48 px
          (<code>lg</code>). Avec <code>href</code>, le bouton est un lien. Tant qu&apos;il n&apos;y
          a pas de panier, on écrit « Voir le produit », jamais « Acheter ».
        </p>
      }
    >
      <div className="flex flex-col gap-8">
        {rows.map((row) => (
          <div key={row.label}>
            <h3 className="mb-3 text-base font-bold">{row.label}</h3>
            <Row variant={row.variant} dark={row.dark} pressed={row.pressed} />
          </div>
        ))}
        <div>
          <h3 className="mb-3 text-base font-bold">Tailles</h3>
          <div className="flex flex-wrap items-center gap-4 rounded-card bg-surface-2 p-5">
            <Button size="md">Taille md (44 px)</Button>
            <Button size="lg">Taille lg (48 px)</Button>
            <Button href="/livraison" variant="secondary" size="lg">
              Lien en bouton
            </Button>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-base font-bold">Anciennes variantes : alias temporaires</h3>
          <p className="max-w-3xl text-sm text-muted">
            Une couleur de marque ne sert jamais à une action. Les anciens noms restent acceptés le
            temps de refaire l&apos;accueil, les pages marque et la fiche (lots 3 à 5) :{" "}
            {Object.entries(LEGACY_BUTTON_VARIANTS).map(([legacy, target], index) => (
              <span key={legacy}>
                {index > 0 ? ", " : ""}
                <code>{legacy}</code> → <code>{target}</code>
              </span>
            ))}
            . Variantes actuelles : {BUTTON_VARIANTS.join(", ")}.
          </p>
        </div>
      </div>
    </StyleguideSection>
  );
}
