import { buttonClasses } from "@/components/ui/button-styles";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { routeFor } from "@/config/site";

/** Question 1 du quiz (maquette) ; les valeurs suivent `compare_group` (§5.4). */
const options = [
  { value: "phones", label: "Un smartphone" },
  { value: "audio", label: "Des écouteurs" },
  { value: "wearables", label: "Une montre ou un bracelet" },
] as const;

/**
 * Aperçu du quiz d'aide au choix sur l'accueil (§4.5, écart E18) : la question 1 seule, en
 * formulaire GET vers `/aide-au-choix`, sans JavaScript. Composant prêt dès l'étape 3 mais rendu
 * seulement quand la route existe (étape 5) : `routeFor("aideAuChoix")` vaut `null` avant.
 * `preview` affiche le formulaire sans cible ni envoi possible (styleguide).
 */
export function QuizTeaser({ preview = false }: { preview?: boolean }) {
  const action = routeFor("aideAuChoix");
  if (!action && !preview) return null;

  return (
    <section
      id={preview ? undefined : "aide"}
      aria-labelledby={preview ? "aide-apercu-titre" : "aide-titre"}
      className="bg-surface-dark section text-on-dark"
      data-tone="dark"
    >
      <div className="wrap grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-16">
        <div>
          <Eyebrow tone="dark">Aide au choix</Eyebrow>
          <h2 id={preview ? "aide-apercu-titre" : "aide-titre"} className="mt-3 text-display-h2">
            Besoin d’aide pour choisir ?
          </h2>
          <p className="mt-4 max-w-[640px] text-[19px] leading-normal text-muted-on-dark">
            Répondez à quelques questions : nous vous proposons les modèles les plus adaptés.
          </p>
        </div>
        <form
          method="get"
          action={preview ? undefined : (action ?? undefined)}
          className="rounded-box bg-surface-dark-2 p-6 sm:p-9"
        >
          <p className="text-sm text-muted-on-dark">Question 1</p>
          <fieldset>
            <legend className="mt-2 mb-6 text-[24px] leading-tight font-bold sm:text-[30px]">
              Que recherchez-vous ?
            </legend>
            {options.map((option, index) => (
              <label
                key={option.value}
                className="mb-2.5 flex min-h-[58px] cursor-pointer items-center gap-3 rounded-option border border-on-dark/20 px-5 font-medium has-checked:border-on-dark"
              >
                <input
                  type="radio"
                  name="type"
                  value={option.value}
                  defaultChecked={index === 0}
                  className="size-4 accent-accent-on-dark"
                />
                {option.label}
              </label>
            ))}
          </fieldset>
          <button
            type={preview ? "button" : "submit"}
            className={buttonClasses({ variant: "light", className: "mt-4" })}
          >
            Continuer
          </button>
        </form>
      </div>
    </section>
  );
}
