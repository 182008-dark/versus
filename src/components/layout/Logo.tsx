import clsx from "clsx";
import Link from "next/link";
import { routeFor, site } from "@/config/site";

/**
 * Logo VERSUS (maquette : `.logo` + `.mono`) : monogramme « VS » dont les lettres sont séparées
 * par une barre oblique en accent (signature VERSUS, §4.2), puis le nom espacé.
 * Lien vers l'accueil quand la route est livrée, simple texte sinon. `onClick` sert au menu
 * mobile, qui se ferme quand on suit le lien.
 */
export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  const home = routeFor("accueil");
  const content = (suffix?: string) => (
    <>
      <span
        aria-hidden="true"
        className="grid size-7 shrink-0 place-items-center rounded-chip bg-ink text-[10.5px] font-extrabold tracking-normal text-on-dark"
      >
        <span className="flex items-center">
          V
          <span className="mx-px inline-block h-[11px] w-[1.5px] rotate-[22deg] rounded-full bg-accent-on-dark" />
          S
        </span>
      </span>
      <span>
        {site.name}
        {suffix ? <span className="sr-only">{suffix}</span> : null}
      </span>
    </>
  );
  // Le pseudo-élément agrandit la zone cliquable à 44 px de haut sans changer la mise en page.
  const classes = clsx(
    "relative inline-flex items-center gap-[9px] before:absolute before:inset-x-0 before:-inset-y-2 font-display text-[15px] font-extrabold tracking-[0.18em] text-ink",
    className,
  );

  if (!home) return <span className={classes}>{content()}</span>;
  // Nom accessible « VERSUS, accueil » : le texte visible en tête du nom (WCAG 2.5.3).
  return (
    <Link href={home} className={classes} onClick={onClick}>
      {content(", accueil")}
    </Link>
  );
}
