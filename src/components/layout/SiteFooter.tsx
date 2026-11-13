import Link from "next/link";
import { footerColumns, legalLinks, site } from "@/config/site";
import { Logo } from "./Logo";
import { PaymentBadges } from "./PaymentBadges";

const linkClasses =
  "block py-[5px] text-muted-strong state-hover:text-ink state-hover:underline underline-offset-2";

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
                    <Link href={link.href} className={linkClasses}>
                      {link.label}
                    </Link>
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
                  <Link href={link.href} className={linkClasses}>
                    {link.label}
                  </Link>
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
