import Link from "next/link";
import { infoLinks, site } from "@/config/site";

// Page d'accueil provisoire (étape 1) : l'accueil fidèle à la maquette arrive à l'étape 3.
export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-24 text-center">
      <div className="flex flex-col items-center gap-6">
        <p className="flex items-center gap-3 font-display text-lg font-extrabold tracking-[0.18em] text-ink">
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-[10px] bg-ink text-sm tracking-normal text-white"
          >
            VS
          </span>
          VERSUS
        </p>
        <h1 className="text-5xl font-extrabold sm:text-7xl">Bientôt en ligne</h1>
        <p className="max-w-xl text-lg leading-relaxed text-ink-muted">
          {site.tagline} Smartphones, écouteurs et montres, avec des prix indicatifs en FCFA pour le
          Togo.
        </p>
      </div>

      <nav aria-label="Informations">
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {infoLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-ink underline decoration-1 underline-offset-4 hover:decoration-2"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
