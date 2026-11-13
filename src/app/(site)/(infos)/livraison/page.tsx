import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/layout/InfoPage";
import { ScrollRegion } from "@/components/ui/ScrollRegion";
import {
  cashOnDeliveryCapFcfa,
  deliveryZones,
  freeDeliveryLomeFromFcfa,
  returnWindowDays,
} from "@/config/policies";
import { routeFor } from "@/config/site";
import { formatFCFA } from "@/lib/format/fcfa";

export const metadata: Metadata = {
  title: "Livraison et retours",
  description:
    "Zones, frais et délais de livraison au Togo, et conditions de retour de VERSUS (boutique fictive, aucune livraison réelle).",
};

export default function LivraisonPage() {
  const garantie = routeFor("garantie");
  const cgv = routeFor("cgv");

  return (
    <InfoPage
      title="Livraison et retours"
      intro="Comment une commande VERSUS serait livrée à Lomé et dans le reste du Togo. Le site est fictif : aucun colis n'est jamais expédié."
    >
      <h2>Zones et frais de livraison</h2>
      <p>
        Les frais dépendent de la zone de livraison. Ils sont affichés avant la validation de la
        commande et recalculés par le serveur : le montant envoyé par le navigateur n&apos;est
        jamais pris en compte.
      </p>
      <ScrollRegion label="Frais et délais de livraison par zone">
        <table className="w-full border-collapse text-left text-[15px]">
          <caption className="sr-only">Frais et délais de livraison par zone</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="py-2 pr-4 font-semibold">
                Zone
              </th>
              <th scope="col" className="py-2 pr-4 font-semibold">
                Frais
              </th>
              <th scope="col" className="py-2 font-semibold">
                Délai indicatif
              </th>
            </tr>
          </thead>
          <tbody>
            {deliveryZones.map((zone) => (
              <tr key={zone.name} className="border-b border-line-soft">
                <th scope="row" className="py-2 pr-4 font-normal">
                  {zone.name}
                </th>
                <td className="py-2 pr-4 whitespace-nowrap">{formatFCFA(zone.feeFcfa)}</td>
                <td className="py-2">{zone.delay}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollRegion>
      <p>
        La livraison à Lomé est offerte à partir de {formatFCFA(freeDeliveryLomeFromFcfa)} de
        commande. Ces montants sont des valeurs de démonstration.
      </p>

      <h2>Suivi de commande</h2>
      <p>
        Chaque commande reçoit un numéro. Avec ce numéro et le téléphone saisi lors de la commande,
        on peut suivre ses étapes : confirmée, payée, préparée, expédiée, livrée. Le suivi en ligne
        arrive avec la commande simulée (étape 6 du projet).
      </p>

      <h2>Paiement à la livraison</h2>
      <p>
        Le paiement à la livraison est proposé partout au Togo, jusqu&apos;à{" "}
        {formatFCFA(cashOnDeliveryCapFcfa)} par commande. Le livreur ne passe jamais : le paiement
        est simulé, comme T-Money, Flooz et la carte bancaire.
      </p>

      <h2>Retours</h2>
      <ul>
        <li>
          Un produit non ouvert peut être retourné dans les {returnWindowDays} jours suivant la
          livraison, dans son emballage d&apos;origine.
        </li>
        <li>Le remboursement utiliserait le moyen de paiement de la commande.</li>
        <li>
          Un produit défectueux relève de la garantie
          {garantie ? (
            <>
              {" "}
              (voir la page <Link href={garantie}>Garantie</Link>)
            </>
          ) : null}
          .
        </li>
      </ul>
      <p>
        Ces règles illustrent le fonctionnement d&apos;une boutique en ligne
        {cgv ? (
          <>
            {" "}
            et complètent les <Link href={cgv}>conditions générales de vente</Link>
          </>
        ) : null}
        . Elles n&apos;engagent personne : aucune vente n&apos;est réelle.
      </p>
    </InfoPage>
  );
}
