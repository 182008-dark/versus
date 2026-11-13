import { ProductCard } from "@/components/product/ProductCard";
import { PillGroup } from "@/components/ui/PillGroup";
import { Price } from "@/components/ui/Price";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { products } from "@/data/catalog";
import { StyleguideSection } from "./StyleguideSection";

export function CatalogSection() {
  const sample = products[0];
  if (!sample) return null;

  return (
    <StyleguideSection
      id="catalogue"
      eyebrow="6. Catalogue"
      title="Composants de l’accueil et des produits"
      intro="Primitives livrées avec leur premier usage à l’étape 3."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
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
            <Price amount={sample.min_price_fcfa} prefix="Dès" className="font-semibold" />
          </div>
          <div>
            <h3 className="mb-3 text-base font-bold">SectionHeader · en-tête de section</h3>
            <SectionHeader eyebrow="Nouveautés" title="Les derniers arrivés." />
          </div>
          <div>
            <h3 className="mb-3 text-base font-bold">Reveal · mouvement progressif</h3>
            <Reveal className="rounded-option bg-surface p-5">Contenu visible par défaut.</Reveal>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-base font-bold">ProductCard · carte de catalogue</h3>
          <div className="max-w-[340px]">
            <ProductCard product={{ ...sample, is_new: true }} />
          </div>
        </div>
      </div>
    </StyleguideSection>
  );
}
