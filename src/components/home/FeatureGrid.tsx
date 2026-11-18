import { Icon, type IconName } from "@/components/ui/Icon";

/**
 * Réassurance (refonte, §3.1) : trois éléments avec icône, sans numéro. Chacun dit qu'il est
 * simulé ou indicatif : la boutique est fictive.
 */
const features: ReadonlyArray<{ icon: IconName; title: string; body: string }> = [
  {
    icon: "truck",
    title: "Livraison",
    body: "À Lomé et en régions, livraison simulée.",
  },
  {
    icon: "mobileMoney",
    title: "Paiement",
    body: "T-Money, Flooz, carte ou à la livraison, paiements simulés.",
  },
  {
    icon: "shield",
    title: "Garantie",
    body: "12 mois, durée indicative précisée sur chaque fiche.",
  },
];

export function FeatureGrid() {
  return (
    <section aria-labelledby="engagements-titre" className="section">
      <h2 id="engagements-titre" className="sr-only">
        Nos engagements
      </h2>
      <ul className="wrap grid gap-8 sm:grid-cols-3">
        {features.map((feature) => (
          <li key={feature.title} className="reveal">
            <span className="grid size-12 place-items-center rounded-control bg-surface text-ink">
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
