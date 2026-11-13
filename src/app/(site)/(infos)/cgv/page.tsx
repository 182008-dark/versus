import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/layout/InfoPage";
import { cashOnDeliveryCapFcfa, paymentWindowMinutes, returnWindowDays } from "@/config/policies";
import { routeFor, site } from "@/config/site";
import { formatFCFA } from "@/lib/format/fcfa";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description:
    "Conditions générales de vente d'exemple de VERSUS, boutique fictive : aucune vente réelle, paiements simulés.",
};

export default function CgvPage() {
  const livraison = routeFor("livraison");
  const garantie = routeFor("garantie");
  const confidentialite = routeFor("confidentialite");

  return (
    <InfoPage
      title="Conditions générales de vente"
      intro="Un exemple de conditions de vente, écrit pour un projet pédagogique. Elles n'ont aucune valeur contractuelle : VERSUS ne vend rien."
    >
      <h2>1. Objet</h2>
      <p>
        Ces conditions décrivent comment une commande serait passée, payée et livrée sur VERSUS,
        boutique de produits Apple, Samsung et Xiaomi destinée au Togo. Le site est fictif : aucun
        contrat n&apos;est formé, aucun produit n&apos;est livré, aucun paiement n&apos;est
        encaissé.
      </p>

      <h2>2. Produits et prix</h2>
      <ul>
        <li>Les caractéristiques de chaque produit figurent sur sa fiche.</li>
        <li>
          Les prix sont indiqués en francs CFA (FCFA), toutes taxes comprises. Ils sont indicatifs
          et ne correspondent à aucune offre réelle.
        </li>
        <li>
          Le prix retenu est celui calculé par le serveur au moment de la commande, jamais celui
          envoyé par le navigateur.
        </li>
      </ul>

      <h2>3. Commande</h2>
      <p>
        Une commande se passe en quatre étapes : coordonnées, livraison, paiement, récapitulatif.
        Elle peut être passée sans compte. Le stock est vérifié et réservé au moment de la
        validation ; un produit épuisé entre-temps est signalé avant tout paiement.
      </p>

      <h2>4. Paiement (simulé)</h2>
      <ul>
        <li>
          <strong>T-Money et Flooz</strong> : la confirmation sur le téléphone est simulée par le
          site. La commande doit être réglée dans les {paymentWindowMinutes} minutes, sinon elle est
          annulée et le stock libéré.
        </li>
        <li>
          <strong>Carte bancaire</strong> : simulée, sans aucun champ de numéro de carte.
        </li>
        <li>
          <strong>À la livraison</strong> : jusqu&apos;à {formatFCFA(cashOnDeliveryCapFcfa)} par
          commande.
        </li>
      </ul>
      <p>
        Le site ne demande jamais de code PIN, de mot de passe mobile money ni de numéro de carte.
      </p>

      <h2>5. Livraison</h2>
      <p>
        Zones, frais et délais sont détaillés sur la page{" "}
        {livraison ? <Link href={livraison}>Livraison et retours</Link> : "Livraison et retours"}.
      </p>

      <h2>6. Retours</h2>
      <p>
        Un produit non ouvert peut être retourné dans les {returnWindowDays} jours suivant sa
        livraison. Le remboursement utiliserait le moyen de paiement de la commande.
      </p>

      <h2>7. Garantie</h2>
      <p>
        Les produits défectueux sont couverts selon les conditions de la page{" "}
        {garantie ? <Link href={garantie}>Garantie</Link> : "Garantie"}.
      </p>

      <h2>8. Données personnelles</h2>
      <p>
        Les informations saisies servent uniquement à traiter la commande simulée. Voir la{" "}
        {confidentialite ? (
          <Link href={confidentialite}>politique de confidentialité</Link>
        ) : (
          "politique de confidentialité"
        )}
        .
      </p>

      <h2>9. Nature du site</h2>
      <p>
        {site.name} est un projet pédagogique non commercial. Apple, Samsung et Xiaomi sont des
        marques de leurs propriétaires respectifs ; {site.name} n&apos;est ni partenaire ni
        revendeur agréé de ces marques.
      </p>
    </InfoPage>
  );
}
