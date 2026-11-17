import type { CSSProperties } from "react";
import { ProductVisual } from "@/components/product/ProductVisual";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { productHref } from "@/config/site";
import { brandThemes } from "@/lib/brand-themes";
import type { CatalogCategory, CompareGroup, HomeEntry } from "@/lib/catalog/types";
import { homeRows } from "@/lib/compare/rows";
import { CompareFamilies } from "./CompareFamilies";

const FAMILY_LABELS: Record<CompareGroup, string> = {
  phones: "Smartphones",
  audio: "Écouteurs",
  wearables: "Montres et bracelets",
};

const MAX_PER_FAMILY = 3;

/**
 * Comparateur de l'accueil (§4.5, écart E19), section `#comparer` qui remplace la section
 * épinglée de la maquette (titre repris). Un vrai `<table>` par famille, 6 lignes clés déclarées
 * dans `lib/compare/rows.ts` (`home: true`), produits issus de `home_slots` (« compare »).
 * Onglets de famille : îlot client CompareFamilies, Smartphones par défaut. Étape 3 : « Voir le
 * produit » mène à la fiche ; « Ajouter au panier » et « Comparateur complet → » à l'étape 5.
 */
export function CompareShowcase({
  entries,
  categories,
}: {
  entries: readonly HomeEntry[];
  categories: readonly CatalogCategory[];
}) {
  const groups = [...new Set(categories.map((category) => category.compare_group))];
  const families = groups.flatMap((group) => {
    const products = entries
      .map((entry) => entry.product)
      .filter((product) => product.compare_group === group)
      .slice(0, MAX_PER_FAMILY);
    if (products.length === 0) return [];
    const label = FAMILY_LABELS[group];
    const rows = homeRows(group);
    return [
      {
        value: group,
        label,
        panel: (
          <div
            role="region"
            aria-label={`Comparaison : ${label}`}
            tabIndex={0}
            className="compare-box zoom"
          >
            <table className="compare-table">
              <caption className="sr-only">
                {`${label} : ${rows.length} caractéristiques clés, valeurs indicatives`}
              </caption>
              <thead>
                <tr>
                  {/* En-tête de la colonne des libellés : « Modèle » à l'écran, nom explicite lu. */}
                  <th scope="col" className="compare-row-label">
                    <span aria-hidden="true">Modèle</span>
                    <span className="sr-only">Caractéristique</span>
                  </th>
                  {products.map((product) => (
                    <th
                      scope="col"
                      key={product.code}
                      className="compare-product"
                      // Nom de colonne court, sans le lien qu'elle contient (relu à chaque cellule).
                      aria-label={`${product.brand_name} ${product.name}`}
                      style={
                        { "--compare-brand": brandThemes[product.brand_slug].ink } as CSSProperties
                      }
                    >
                      <ProductVisual
                        product={product}
                        decorative
                        sizes="150px"
                        className="compare-art"
                      />
                      <span className="compare-brand">{product.brand_name}</span>
                      <span className="compare-name">{product.name}</span>
                      <a className="compare-link" href={productHref(product.slug)}>
                        Voir le produit<span className="sr-only"> {product.name}</span>
                      </a>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key}>
                    <th scope="row" className="compare-row-label">
                      {row.label}
                    </th>
                    {products.map((product) => (
                      <td
                        key={product.code}
                        className={row.key === "price" ? "compare-price" : undefined}
                      >
                        {row.format(product) ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      },
    ];
  });

  return (
    <section id="comparer" className="bg-surface section">
      <div className="wrap">
        <SectionHeader
          eyebrow="Comparateur"
          title="iPhone, Galaxy ou Redmi ?"
          intro="Comparez avant d’acheter. Caractéristiques et prix indicatifs."
          stacked
        />
        <div className="mt-7">
          <CompareFamilies families={families} />
        </div>
        <p className="mt-3.5 px-1 text-[13px] text-muted">
          Sélection VERSUS : jusqu’à trois modèles par catégorie, valeurs indicatives.
        </p>
      </div>
    </section>
  );
}
