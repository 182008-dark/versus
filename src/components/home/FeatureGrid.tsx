import { Icon, type IconName } from "@/components/ui/Icon";

/**
 * Réassurance (maquette : `.assur`, 4 colonnes, puis 2 sous 1025 px et 1 sous 641 px). Textes de
 * la maquette ; le caractère fictif (paiement simulé) est rappelé par le bandeau permanent.
 */
const features: ReadonlyArray<{ icon: IconName; title: string; body: string }> = [
  {
    icon: "mobileMoney",
    title: "Mobile money",
    body: "T-Money ou Flooz en quelques secondes, paiement simulé.",
  },
  {
    icon: "cash",
    title: "Paiement à la livraison",
    body: "Vous voyez votre produit avant de payer, partout au Togo.",
  },
  {
    icon: "shield",
    title: "Produits garantis",
    body: "La durée de garantie est indiquée sur chaque fiche.",
  },
  {
    icon: "truck",
    title: "Livraison suivie",
    body: "À Lomé et dans tout le pays, avec suivi de commande.",
  },
];

export function FeatureGrid() {
  return (
    <section aria-labelledby="engagements-titre" className="py-20">
      <h2 id="engagements-titre" className="sr-only">
        Nos engagements
      </h2>
      <ul className="wrap grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <li key={feature.title} className="reveal">
            <span className="grid size-12 place-items-center rounded-icon bg-surface text-ink">
              <Icon name={feature.icon} size={24} stroke={1.6} />
            </span>
            <h3 className="mt-4 mb-1.5 text-[17px] font-bold">{feature.title}</h3>
            <p className="text-[15px] leading-normal text-muted">{feature.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
