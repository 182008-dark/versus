import clsx from "clsx";

export type RadioPillOption = {
  value: string;
  label: string;
  /** Précision lue par les lecteurs d'écran après le libellé (« , 3 produits »). */
  hint?: string;
};

/**
 * Pastilles à choix unique (maquette : `.pills`), sans JavaScript (refonte §4.7) : un `<fieldset>`
 * nommé par sa `<legend>` et des boutons radio natifs (flèches du clavier, choix annoncé). Le
 * bouton radio, invisible, couvre toute la pastille (cible de 44 px) ; l'état coché et le focus
 * sont dessinés sur la pastille (`has-checked`, `has-focus-visible`). Ce que le choix affiche est
 * décidé en CSS par le conteneur (`:has(input[value=…]:checked)`, voir globals.css). Composant
 * serveur : rien de ceci ne pèse dans le JavaScript.
 */
export function RadioPills({
  legend,
  name,
  options,
  defaultValue,
  nowrap = false,
}: {
  legend: string;
  /** Nom du groupe de boutons radio, unique dans la page. */
  name: string;
  options: readonly RadioPillOption[];
  defaultValue: string;
  /** Une seule ligne (le parent fait défiler) plutôt qu'un retour à la ligne. */
  nowrap?: boolean;
}) {
  return (
    <fieldset className={clsx("flex gap-2", nowrap ? "w-max flex-nowrap" : "flex-wrap")}>
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className={clsx(
            "relative inline-flex h-11 items-center rounded-full border px-5 text-sm font-medium whitespace-nowrap transition-colors",
            "border-line-control bg-bg text-ink state-hover:border-ink",
            "has-checked:border-ink has-checked:bg-ink has-checked:text-on-dark",
            "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--focus-ring)",
          )}
        >
          {option.label}
          {option.hint ? <span className="sr-only">{option.hint}</span> : null}
          <input
            type="radio"
            name={name}
            value={option.value}
            defaultChecked={option.value === defaultValue}
            className="absolute inset-0 cursor-pointer appearance-none rounded-full opacity-0"
          />
        </label>
      ))}
    </fieldset>
  );
}
