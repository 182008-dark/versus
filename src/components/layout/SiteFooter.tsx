import { footerColumns, legalLinks, site } from "@/config/site";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";
import { PaymentBadges } from "./PaymentBadges";

/**
 * Liens du pied de page : 44 px de haut sous 641 px (cible tactile du design system), 26 px
 * au-delà comme la maquette. La page courante (`aria-current`, posé par NavLink) est en encre
 * et soulignée : l'indication ne repose pas sur la seule couleur.
 */
const linkClasses =
  "flex min-h-11 items-center text-muted-strong state-hover:text-ink state-hover:underline " +
  "aria-[current=page]:text-ink aria-[current=page]:underline sm:block sm:min-h-0 sm:py-[5px]";

/**
 * Pied de page (maquette : `.foot`), landmark `contentinfo` de premier niveau.
 * Colonnes de la maquette (Boutique, Aide, VERSUS), liens issus de config/site.ts : une colonne
 * sans lien livré disparaît. Mobile d'abord : 1 colonne, 2 à partir de 641 px, 1,6 + 3 à
 * partir de 1025 px.
 */
export function SiteFooter() {
  return (
    <footer className="bg-surface pt-[60px] pb-10 text-[13px] leading-[normal] text-muted">
      <div className="wrap">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <Logo />
            <p className="mt-3.5 max-w-80 leading-[1.6]">{site.tagline}</p>
            <PaymentBadges />
          </div>
          {footerColumns.map((column, index) => (
            <nav key={column.label} aria-labelledby={`pied-de-page-${index}`}>
              <h2
                id={`pied-de-page-${index}`}
                className="mb-2.5 font-sans text-[13px] font-semibold tracking-normal text-ink"
              >
                {column.label}
              </h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <NavLink href={link.href} className={linkClasses}>
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 border-t border-line pt-5 leading-[1.6]">
          {legalLinks.length > 0 ? (
            <ul aria-label="Informations légales" className="mb-2 flex flex-wrap gap-x-5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <NavLink href={link.href} className={linkClasses}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : null}
          <p>
            © {site.copyrightYear} {site.name} · {site.legal}
          </p>
        </div>
      </div>
    </footer>
  );
}
