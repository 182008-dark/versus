import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/layout/InfoPage";
import { returnWindowDays } from "@/config/policies";
import { routeFor } from "@/config/site";

export const metadata: Metadata = {
  title: "Garantie",
  description:
    "Garantie des produits Apple, Samsung et Xiaomi présentés par VERSUS (boutique fictive, projet pédagogique).",
};

export default function GarantiePage() {
  const livraison = routeFor("livraison");

  return (
    <InfoPage
      title="Garantie"
      intro="Ce que couvrirait la garantie d'un produit acheté chez VERSUS. Le site est fictif : aucune garantie n'est réellement accordée."
    >
      <h2>Durée</h2>
      <p>
        La durée de garantie est indiquée sur chaque fiche produit (12 ou 24 mois selon le modèle).
        Elle court à partir de la date de livraison inscrite dans le suivi de la commande.
      </p>

      <h2>Ce qui est couvert</h2>
      <ul>
        <li>Les pannes et défauts de fabrication apparus lors d&apos;un usage normal.</li>
        <li>Un produit qui ne correspond pas à sa fiche (modèle, couleur, capacité).</li>
        <li>Une batterie dont la capacité chute anormalement pendant la durée de garantie.</li>
      </ul>

      <h2>Ce qui n&apos;est pas couvert</h2>
      <ul>
        <li>La casse, l&apos;oxydation ou les chocs, même accidentels.</li>
        <li>L&apos;usure normale (rayures, coques, bracelets).</li>
        <li>Une réparation ou une modification faite par un tiers non agréé.</li>
      </ul>

      <h2>Faire jouer la garantie</h2>
      <ol>
        <li>Retrouver le numéro de commande et la date de livraison.</li>
        <li>Décrire la panne : le service client proposerait un diagnostic à distance.</li>
        <li>
          Si le défaut est confirmé : réparation, remplacement par un modèle identique ou, à défaut,
          remboursement.
        </li>
      </ol>
      <p>
        Un produit qui ne convient pas mais fonctionne relève du retour sous {returnWindowDays}{" "}
        jours
        {livraison ? (
          <>
            {" "}
            (voir <Link href={livraison}>Livraison et retours</Link>)
          </>
        ) : null}
        , pas de la garantie.
      </p>

      <h2>Garantie des marques</h2>
      <p>
        Apple, Samsung et Xiaomi proposent leurs propres garanties et services après-vente. VERSUS
        n&apos;est ni revendeur agréé ni partenaire de ces marques : ce projet pédagogique ne peut
        ouvrir aucun droit auprès d&apos;elles.
      </p>
    </InfoPage>
  );
}
