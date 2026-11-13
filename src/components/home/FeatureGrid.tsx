import { Eyebrow } from "@/components/ui/Eyebrow";

const features = [
  {
    title: "Trois marques, un seul endroit",
    body: "Comparez Apple, Samsung et Xiaomi sans multiplier les recherches.",
    icon: "01",
  },
  {
    title: "Des prix indicatifs en FCFA",
    body: "Les prix sont affichés en francs CFA pour vous repérer simplement.",
    icon: "02",
  },
  {
    title: "Un projet pédagogique",
    body: "Aucune vente réelle, aucun paiement encaissé, aucun produit livré.",
    icon: "03",
  },
];

export function FeatureGrid() {
  return (
    <section className="wrap section">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow className="justify-center">L’expérience VERSUS</Eyebrow>
        <h2 className="mt-3 text-display-h2">Le bon choix, sans complication.</h2>
      </div>
      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <li key={feature.icon} className="rounded-box bg-surface p-7">
            <span aria-hidden="true" className="font-display text-sm font-bold text-accent">
              {feature.icon}
            </span>
            <h3 className="mt-5 text-xl font-bold">{feature.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{feature.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
