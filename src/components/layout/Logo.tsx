import clsx from "clsx";
import Link from "next/link";
import { routeFor, site } from "@/config/site";

/**
 * Logo VERSUS (maquette : `.logo` + `.mono`) : monogramme « VS » dont les lettres sont séparées
 * par une barre oblique en accent (signature VERSUS, §4.2), puis le nom espacé.
 * Lien vers l'accueil quand la route est livrée, simple texte sinon.
 */
export function Logo({ className }: { className?: string }) {
  const home = routeFor("accueil");
  const content = (suffix?: string) => (
    <>
      <span
        aria-hidden="true"
        className="grid size-7 shrink-0 place-items-center rounded-chip bg-ink text-[10.5px] font-extrabold tracking-normal text-white"
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
  const classes = clsx(
    "inline-flex items-center gap-[9px] font-display text-[15px] font-extrabold tracking-[0.18em] text-ink",
    className,
  );

  if (!home) return <span className={classes}>{content()}</span>;
  // Nom accessible « VERSUS, accueil » : le texte visible en tête du nom (WCAG 2.5.3).
  return (
    <Link href={home} className={classes}>
      {content(", accueil")}
    </Link>
  );
}
