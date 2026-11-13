import { StyleguideSection } from "./StyleguideSection";

const samples = [
  {
    name: "Hero",
    spec: "text-display-hero · 48 / 64 / 88 px · Plus Jakarta Sans 800",
    className: "text-display-hero",
    text: "iPhone 18 Pro",
  },
  {
    name: "Tuile",
    spec: "text-display-tile · 40 / 58 px · 800",
    className: "text-display-tile",
    text: "Galaxy A57 5G",
  },
  {
    name: "Titre de section",
    spec: "text-display-h2 · 36 / 52 px · 800",
    className: "text-display-h2",
    text: "Comparez avant d'acheter.",
  },
  {
    name: "Quiz",
    spec: "var(--text-quiz) · 24 / 30 px · 700",
    className: "font-display text-[length:var(--text-quiz)] leading-[1.15] font-bold",
    text: "Que cherchez-vous ?",
  },
  {
    name: "Sous-titre",
    spec: "var(--text-sub) · 17 / 21 px · Inter 400",
    className: "text-[length:var(--text-sub)] leading-[1.45] text-muted",
    text: "Puce A20 Pro. Ouverture variable.",
  },
  {
    name: "Texte courant",
    spec: "16 px · Inter 400 · interligne 1,6",
    className: "text-base leading-[1.6]",
    text: "Livraison suivie à Lomé et dans tout le Togo.",
  },
  {
    name: "Légende",
    spec: "13 px · Inter 400 · --muted",
    className: "text-[13px] text-muted",
    text: "Prix indicatifs en FCFA.",
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
          Mobile d&apos;abord : les tailles changent à 641 px puis à 1025 px (variables de{" "}
          <code>:root</code>). Titres en Plus Jakarta Sans, texte en Inter, servies par next/font.
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
      </dl>
    </StyleguideSection>
  );
}
