import Link from "next/link";
import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { routeFor } from "@/config/site";

/**
 * Gabarit des pages d'information (mentions légales, CGV, livraison…) : surtitre, titre de
 * niveau 1, chapô, statut de la version, puis le texte en `prose-info`.
 */
export function InfoPage({
  title,
  intro,
  status = "Version provisoire (étape 2), complétée à l'étape 9.",
  children,
}: {
  title: string;
  intro?: ReactNode;
  status?: string;
  children: ReactNode;
}) {
  const home = routeFor("accueil");
  return (
    <article className="mx-auto w-full max-w-[816px] px-6 py-16 sm:py-20">
      <Eyebrow>Informations</Eyebrow>
      <h1 className="mt-3 text-[40px] leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[52px]">
        {title}
      </h1>
      {intro ? <div className="mt-5 text-[19px] leading-normal text-muted">{intro}</div> : null}
      <p className="mt-4 text-sm text-muted">{status}</p>
      <div className="prose-info mt-6">{children}</div>
      {home ? (
        <p className="mt-14">
          <Link
            href={home}
            className="font-semibold text-accent underline underline-offset-4 state-hover:text-accent-hover"
          >
            Retour à l&apos;accueil
          </Link>
        </p>
      ) : null}
    </article>
  );
}
