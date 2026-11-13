import { Fragment } from "react";
import type { NavGroup } from "@/config/site";
import { NavLink } from "./NavLink";

const itemClasses =
  "relative py-1.5 text-[13.5px] text-ink opacity-80 transition-opacity state-hover:opacity-100 aria-[current=page]:opacity-100 " +
  // Soulignement animé de la maquette (`.nav a::after`)
  "after:absolute after:inset-x-0 after:bottom-0 after:h-[1.5px] after:origin-left after:scale-x-0 after:bg-ink " +
  "after:transition-transform after:duration-350 after:ease-out state-hover:after:scale-x-100 aria-[current=page]:after:scale-x-100";

/**
 * Navigation principale (≥ 901 px), pilotée par `mainNav` de config/site.ts : les groupes
 * (marques | catégories | outils) sont séparés par un filet vertical. Rien n'est rendu si aucun
 * lien n'est livré.
 *
 * `preview` (styleguide seulement) affiche les libellés sans lien, pour comparer la mise en page
 * avec la maquette avant la livraison des routes.
 */
export function MainNav({ groups, preview = false }: { groups: NavGroup[]; preview?: boolean }) {
  if (groups.length === 0) return null;
  return (
    <nav
      aria-label={preview ? "Aperçu de la navigation principale" : "Navigation principale"}
      className="hidden items-center gap-[26px] md:flex"
    >
      {groups.map((group, index) => (
        <Fragment key={group.label}>
          {index > 0 ? <span aria-hidden="true" className="h-4 w-px bg-line" /> : null}
          <ul aria-label={group.label} className="flex items-center gap-[26px]">
            {group.links.map((link) => (
              <li key={link.label}>
                {preview ? (
                  <span className={itemClasses}>{link.label}</span>
                ) : (
                  <NavLink href={link.href} className={itemClasses}>
                    {link.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </Fragment>
      ))}
    </nav>
  );
}
