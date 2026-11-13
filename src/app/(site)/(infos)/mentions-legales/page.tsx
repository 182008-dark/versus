import type { Metadata } from "next";
import Link from "next/link";
import { routeFor } from "@/config/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales provisoires de VERSUS, boutique fictive réalisée pour un projet pédagogique.",
};

// Version provisoire (étape 1). Version complète à l'étape 2, finale à l'étape 9.
export default function MentionsLegalesPage() {
  const accueil = routeFor("accueil");
  const credits = routeFor("credits");

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-16 leading-relaxed">
      <h1 className="text-4xl font-extrabold">Mentions légales</h1>
      <p className="mt-2 text-sm text-ink-muted">Version provisoire.</p>

      <h2 className="mt-10 text-2xl font-bold">Nature du site</h2>
      <p className="mt-3">
        VERSUS est une boutique <strong>fictive</strong>, réalisée dans le cadre d&apos;un projet
        pédagogique. Aucune vente n&apos;est réelle : aucun produit n&apos;est livré, aucun paiement
        n&apos;est encaissé et les prix affichés en FCFA sont indicatifs.
      </p>

      <h2 className="mt-10 text-2xl font-bold">Édition</h2>
      <p className="mt-3">
        Site édité à titre non commercial, dans le cadre d&apos;une formation. Il n&apos;est
        rattaché à aucune société et ne propose aucun service.
      </p>

      <h2 className="mt-10 text-2xl font-bold">Hébergement</h2>
      <p className="mt-3">
        Le site est hébergé par Vercel Inc. (États-Unis), dans la région de Paris (cdg1) pour
        l&apos;exécution des fonctions.
      </p>

      <h2 className="mt-10 text-2xl font-bold">Marques et visuels</h2>
      <p className="mt-3">
        Apple, Samsung et Xiaomi sont des marques de leurs propriétaires respectifs. VERSUS
        n&apos;est ni partenaire, ni revendeur agréé de ces marques. Les visuels de produits
        appartiennent à leurs marques ; leur origine est détaillée dans les{" "}
        {credits ? (
          <Link href={credits} className="underline underline-offset-4">
            crédits
          </Link>
        ) : (
          "crédits"
        )}
        .
      </p>

      <h2 className="mt-10 text-2xl font-bold">Données personnelles</h2>
      <p className="mt-3">
        À ce stade, le site ne collecte aucune donnée personnelle et ne dépose aucun cookie de
        mesure d&apos;audience. Il n&apos;est pas indexé par les moteurs de recherche.
      </p>

      {accueil ? (
        <p className="mt-12">
          <Link href={accueil} className="font-semibold underline underline-offset-4">
            Retour à l&apos;accueil
          </Link>
        </p>
      ) : null}
    </article>
  );
}
