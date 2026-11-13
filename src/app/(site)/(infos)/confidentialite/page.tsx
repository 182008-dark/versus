import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/layout/InfoPage";
import { routeFor } from "@/config/site";

export const metadata: Metadata = {
  title: "Confidentialité",
  description:
    "Données personnelles et cookies sur VERSUS, boutique fictive réalisée pour un projet pédagogique.",
};

export default function ConfidentialitePage() {
  const mentions = routeFor("mentionsLegales");

  return (
    <InfoPage
      title="Confidentialité"
      intro="Quelles données VERSUS collecte, pourquoi, où elles sont stockées et comment les supprimer."
    >
      <h2>Aujourd&apos;hui</h2>
      <p>
        À ce stade du projet, le site ne collecte aucune donnée personnelle : il n&apos;y a ni
        compte, ni commande, ni formulaire. Il ne dépose aucun cookie, ni de mesure d&apos;audience,
        ni de publicité, et il n&apos;est pas indexé par les moteurs de recherche.
      </p>

      <h2>Quand les commandes et les comptes seront ouverts</h2>
      <p>Les données suivantes seront demandées, et seulement celles-ci :</p>
      <ul>
        <li>
          <strong>Commande</strong> : nom, téléphone (format +228), adresse et zone de livraison,
          e-mail facultatif. Elles servent à traiter et suivre la commande simulée.
        </li>
        <li>
          <strong>Compte client</strong> : e-mail, mot de passe (jamais stocké en clair), adresses
          enregistrées et historique des commandes simulées.
        </li>
        <li>
          <strong>Cookies</strong> : uniquement ceux nécessaires à la session et au suivi d&apos;une
          commande passée sans compte. Aucun cookie de mesure ni de publicité.
        </li>
      </ul>
      <p>
        Aucune donnée de paiement n&apos;est collectée : les paiements sont simulés, sans numéro de
        carte ni code PIN.
      </p>

      <h2>Stockage et sécurité</h2>
      <ul>
        <li>Site hébergé par Vercel (exécution des fonctions dans la région de Paris).</li>
        <li>
          Base de données Supabase hébergée à Paris (région eu-west-3), protégée par des règles
          d&apos;accès ligne par ligne : chaque client ne lit que ses propres commandes.
        </li>
      </ul>

      <h2>Vos droits</h2>
      <p>
        Chaque client pourra consulter, corriger et exporter ses données depuis son compte, et
        supprimer son compte à tout moment. Toutes les données de démonstration seront effacées à la
        fin du projet.
      </p>

      <h2>Responsable</h2>
      <p>
        Le site est édité à titre non commercial dans le cadre d&apos;une formation
        {mentions ? (
          <>
            {" "}
            (voir les <Link href={mentions}>mentions légales</Link>)
          </>
        ) : null}
        . N&apos;y saisissez jamais de données réelles sensibles.
      </p>
    </InfoPage>
  );
}
