import { Price } from "@/components/ui/Price";
import { StyleguideSection } from "./StyleguideSection";

const samples = [
  {
    name: "Titre du hero",
    spec: "text-display-hero · 44 / 64 / 76 px · Plus Jakarta Sans 800 · −0,03 em",
    className: "text-display-hero",
    text: "iPhone 18 Pro",
  },
  {
    name: "Nom de marque",
    spec: "text-display-brand · 48 / 72 / 88 px · 800 · −0,03 em",
    className: "text-display-brand",
    text: "Samsung",
  },
  {
    name: "Titre de tuile",
    spec: "text-display-tile · 36 / 48 / 56 px · 700 · −0,025 em",
    className: "text-display-tile",
    text: "Galaxy A57 5G",
  },
  {
    name: "Titre de section",
    spec: "text-display-h2 · 32 / 44 / 48 px · 700 · −0,025 em, sans point final",
    className: "text-display-h2",
    text: "Comparer avant d’acheter",
  },
  {
    name: "Question du quiz",
    spec: "var(--text-quiz) · 24 / 30 px · 700",
    className: "font-display text-[length:var(--text-quiz)] leading-[1.15] font-bold",
    text: "Que cherchez-vous ?",
  },
  {
    name: "Nom sur carte",
    spec: "text-card-name · 16 / 18 px · 700 · 2 lignes au plus",
    className: "text-card-name max-w-[220px]",
    text: "Xiaomi Smart Band 10 Pro, édition céramique",
  },
  {
    name: "Accroche",
    spec: "var(--text-sub) · 17 / 19 px · Inter 400",
    className: "text-[length:var(--text-sub)] leading-[1.45] text-muted",
    text: "Puce A20 Pro, ouverture variable et 48 Mpx partout",
  },
  {
    name: "Texte courant",
    spec: "16 px · Inter 400 · interligne 1,6 · 68 caractères par ligne au plus",
    className: "max-w-[68ch] text-base leading-[1.6]",
    text: "Livraison suivie à Lomé et dans tout le Togo, paiement à la livraison possible.",
  },
  {
    name: "Méta",
    spec: "text-meta · 13 px · Inter 600",
    className: "text-meta text-muted",
    text: "Écouteurs · 3 coloris",
  },
];

export function TypographySection() {
  return (
    <StyleguideSection
      id="typographie"
      eyebrow="2. Typographie"
      title="Échelle typographique"
      intro={
        <p>
          Polices inchangées : Plus Jakarta Sans pour les titres et les prix, Inter pour le texte.
          Titres moins serrés et équilibrés sur leurs lignes (<code>text-wrap: balance</code>), plus
          de petites capitales espacées. Paliers à 641 px puis 1025 px (variables de{" "}
          <code>:root</code>).
        </p>
      }
    >
      <dl className="divide-y divide-line-soft">
        {samples.map((sample) => (
          <div key={sample.name} className="grid gap-2 py-5 md:grid-cols-[220px_1fr] md:gap-8">
            <dt className="text-sm">
              <span className="font-semibold">{sample.name}</span>
              <br />
              <span className="text-muted">{sample.spec}</span>
            </dt>
            <dd className={`min-w-0 break-words ${sample.className}`}>{sample.text}</dd>
          </div>
        ))}
        <div className="grid gap-2 py-5 md:grid-cols-[220px_1fr] md:gap-8">
          <dt className="text-sm">
            <span className="font-semibold">Prix</span>
            <br />
            <span className="text-muted">
              Price · carte 17 / 20 px, hero et bandeau 22 / 28 px · 700, chiffres alignés ; « Dès »
              et « FCFA » à 0,7 × en Inter 600
            </span>
          </dt>
          <dd className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
            <Price amount={970000} from size="lead" />
            <Price amount={43000} from size="card" />
          </dd>
        </div>
      </dl>
    </StyleguideSection>
  );
}
