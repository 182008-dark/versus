import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/layout/InfoPage";
import { routeFor } from "@/config/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de VERSUS, boutique fictive réalisée pour un projet pédagogique.",
};

export default function MentionsLegalesPage() {
  const credits = routeFor("credits");
  const confidentialite = routeFor("confidentialite");

  return (
    <InfoPage title="Mentions légales">
      <h2>Nature du site</h2>
      <p>
        VERSUS est une boutique <strong>fictive</strong>, réalisée dans le cadre d&apos;un projet
        pédagogique. Aucune vente n&apos;est réelle : aucun produit n&apos;est livré, aucun paiement
        n&apos;est encaissé et les prix affichés en FCFA sont indicatifs.
      </p>

      <h2>Édition</h2>
      <p>
        Site édité à titre non commercial, dans le cadre d&apos;une formation. Il n&apos;est
        rattaché à aucune société et ne propose aucun service.
      </p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par Vercel Inc. (États-Unis), dans la région de Paris (cdg1) pour
        l&apos;exécution des fonctions.
      </p>

      <h2>Marques et visuels</h2>
      <p>
        Apple, Samsung et Xiaomi sont des marques de leurs propriétaires respectifs. VERSUS
        n&apos;est ni partenaire, ni revendeur agréé de ces marques. Les visuels de produits
        appartiennent à leurs marques ; leur origine est détaillée dans les{" "}
        {credits ? <Link href={credits}>crédits</Link> : "crédits"}.
      </p>

      <h2>Données personnelles</h2>
      <p>
        À ce stade, le site ne collecte aucune donnée personnelle et ne dépose aucun cookie de
        mesure d&apos;audience. Il n&apos;est pas indexé par les moteurs de recherche. Le détail
        figure dans la{" "}
        {confidentialite ? (
          <Link href={confidentialite}>politique de confidentialité</Link>
        ) : (
          "politique de confidentialité"
        )}
        .
      </p>
    </InfoPage>
  );
}
