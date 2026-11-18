import { BrandSwitcher } from "@/components/brand/BrandSwitcher";
import { CategoryBar } from "@/components/brand/CategoryBar";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { routeFor } from "@/config/site";
import { brands, categories, products } from "@/data/catalog";
import { groupByCategory, productsOfBrand } from "@/lib/catalog/brand-page";
import { StyleguideSection } from "./StyleguideSection";

const PREFIX = "exemple-";

/**
 * Composants des pages marque (refonte, lot 3) : fil d'Ariane, sélecteur « Apple vs Samsung vs
 * Xiaomi », barre de catégories (comptes calculés, catégorie vide masquée) et carte produit en
 * disposition `adaptive`. Données réelles du catalogue (Apple : pas de bracelets).
 */
export function BrandPageSection() {
  const apple = productsOfBrand(products, "apple");
  const groups = groupByCategory(apple, categories);
  const sample = apple[0]!;

  return (
    <StyleguideSection
      id="pages-marque"
      eyebrow="8. Pages marque"
      title="Fil d’Ariane, sélecteur de marque, barre de catégories"
      intro={
        <p>
          Composants serveur, sans JavaScript. Le dernier élément du fil d&apos;Ariane et la marque
          affichée dans le sélecteur ne sont pas des liens : l&apos;en-tête porte le seul « page
          courante » de la page.
        </p>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-card bg-surface-2 p-6">
          <h3 className="text-base font-bold">Breadcrumb · fil d&apos;Ariane</h3>
          <div className="mt-3">
            <Breadcrumb
              items={[{ label: "Accueil", href: routeFor("accueil") }, { label: "Apple" }]}
            />
          </div>
        </div>
        <div data-brand="apple" className="rounded-card bg-brand-ground p-6">
          <h3 className="text-base font-bold">BrandSwitcher · Apple vs Samsung vs Xiaomi</h3>
          <BrandSwitcher brands={brands} current="apple" className="mt-3" />
        </div>
      </div>

      <div className="mt-6 rounded-card bg-surface-2 px-6 pt-4 pb-6">
        <h3 className="text-base font-bold">CategoryBar · Apple (catégorie vide masquée)</h3>
        <div className="mt-2 overflow-hidden">
          <CategoryBar
            brandName="Apple (exemple)"
            groups={groups}
            total={apple.length}
            allId="tout"
            anchorPrefix={PREFIX}
          />
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-4 text-xs text-muted">
          {["tout", ...groups.map((group) => group.category.slug)].map((id) => (
            <li key={id} id={`${PREFIX}${id}`}>
              Cible #{PREFIX}
              {id}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="max-w-[300px]">
          <ProductCard product={{ ...sample, is_new: false }} layout="adaptive" />
        </div>
        <p className="text-sm leading-relaxed text-muted">
          <code>ProductCard layout=&quot;adaptive&quot;</code> : dans <code>grid-products</code>, la
          carte passe en liste (photo à gauche, marque, nom, prix et action à droite) sous 400 px de
          large, verticale au-delà. Voir les captures à 390 px de <code>docs/refonte/lot-3/</code>.
        </p>
      </div>
    </StyleguideSection>
  );
}
