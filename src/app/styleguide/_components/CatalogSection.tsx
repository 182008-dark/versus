import { QuizTeaser } from "@/components/home/QuizTeaser";
import { ProductCard } from "@/components/product/ProductCard";
import { Pill } from "@/components/ui/Pill";
import { PillGroup } from "@/components/ui/PillGroup";
import { Price } from "@/components/ui/Price";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { products } from "@/data/catalog";
import { StyleguideSection } from "./StyleguideSection";

/** États de Pill montrés sans interaction : data-state force survol et focus (globals.css). */
const pillStates = [
  { label: "Non sélectionnée", text: "Apple", props: {} },
  { label: "Sélectionnée (aria-pressed)", text: "Toutes", props: { selected: true } },
  { label: "Survol", text: "Samsung", props: { "data-state": "hover" } },
  { label: "Focus clavier", text: "Xiaomi", props: { "data-state": "focus" } },
] as const;

export function CatalogSection() {
  const sample = products[0];
  if (!sample) return null;

  return (
    <StyleguideSection
      id="catalogue"
      eyebrow="7. Catalogue"
      title="Composants de l’accueil et des produits"
      intro="Primitives livrées avec leur premier usage à l’étape 3."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-base font-bold">Pill · pastille bascule</h3>
            <div className="flex flex-wrap items-end gap-4">
              {pillStates.map((state) => (
                <figure key={state.label} className="flex flex-col items-start gap-2">
                  <figcaption className="text-xs text-muted">{state.label}</figcaption>
                  <Pill {...state.props}>{state.text}</Pill>
                </figure>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-base font-bold">PillGroup · filtres de marque</h3>
            <PillGroup
              label="Exemple de filtres"
              defaultValue="all"
              options={[
                { value: "all", label: "Toutes" },
                { value: "apple", label: "Apple" },
                { value: "samsung", label: "Samsung" },
                { value: "xiaomi", label: "Xiaomi" },
              ]}
            />
          </div>
          <div>
            <h3 className="mb-3 text-base font-bold">Price · montant FCFA</h3>
            <Price amount={sample.variants.map((variant) => variant.price_fcfa)} size="card" />
          </div>
          <div>
            <h3 className="mb-3 text-base font-bold">SectionHeader · en-tête de section</h3>
            <SectionHeader eyebrow="Nouveautés" title="Les derniers arrivés" />
          </div>
          <div>
            <h3 className="mb-3 text-base font-bold">Reveal · mouvement progressif</h3>
            <Reveal className="rounded-control bg-surface p-5">Contenu visible par défaut.</Reveal>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-base font-bold">ProductCard · carte de catalogue</h3>
          <div className="max-w-[340px]">
            <ProductCard product={{ ...sample, is_new: true }} />
          </div>
        </div>
      </div>
      <div className="mt-10">
        <h3 className="mb-3 text-base font-bold">
          QuizTeaser · aperçu non soumis (affiché sur l’accueil à l’étape 5)
        </h3>
        <div className="overflow-hidden rounded-tile">
          <QuizTeaser preview />
        </div>
      </div>
    </StyleguideSection>
  );
}
