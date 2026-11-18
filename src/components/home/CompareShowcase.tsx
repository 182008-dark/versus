import type { CSSProperties } from "react";
import { ProductVisual } from "@/components/product/ProductVisual";
import { Price } from "@/components/ui/Price";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { VsMark } from "@/components/ui/VsMark";
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

/** « Apple iPhone 18 Pro », mais « Xiaomi 17 Ultra » (la marque n'est pas répétée). */
function fullName(product: { brand_name: string; name: string }) {
  return product.name.startsWith(product.brand_name)
    ? product.name
    : `${product.brand_name} ${product.name}`;
}

/**
 * Comparateur de l'accueil (refonte, §3.1 et §4.7), section `#comparer`. Un vrai `<table>` par
 * famille, lignes clés de `lib/compare/rows.ts` (`home: true`, le prix en premier), produits
 * issus de `home_slots` (« compare ») : iPhone 18 Pro / Galaxy S26 Ultra / Xiaomi 17 Ultra, etc.
 * - à partir de 641 px : tableau, colonne de produit avec photo et « Voir le produit » ;
 * - en dessous : une carte par critère, les trois valeurs empilées (une ligne par produit, valeur
 *   toujours alignée à droite, même quand elle passe sous le nom), puis une liste de liens vers
 *   les fiches, chacun nommant son modèle à l'écran (« Voir le produit Galaxy S26 Ultra ») :
 *   chaque colonne mène toujours à la fiche (D5). En CSS, sans JavaScript ; un montant n'est
 *   jamais coupé (`<Price>`, `white-space: nowrap`).
 * Médaillon « VS » dans l'en-tête. Onglets de famille : îlot client CompareFamilies.
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
                      aria-label={fullName(product)}
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
                        data-product-label={fullName(product)}
                        className={row.key === "price" ? "compare-price" : undefined}
                      >
                        {row.key === "price" && product.min_price_fcfa !== null ? (
                          <Price
                            amount={[
                              product.min_price_fcfa,
                              product.max_price_fcfa ?? product.min_price_fcfa,
                            ]}
                          />
                        ) : (
                          // Élément (et non texte nu) : sur téléphone, il reste aligné à droite
                          // même quand il passe sous le nom du modèle.
                          <span className="compare-value">{row.format(product) ?? "—"}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <ul role="list" className="compare-mobile-links">
              {products.map((product) => (
                <li key={product.code}>
                  <a className="compare-link" href={productHref(product.slug)}>
                    <span>
                      Voir le produit <strong className="compare-link-name">{product.name}</strong>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ),
      },
    ];
  });

  return (
    <section id="comparer" aria-labelledby="comparer-titre" className="bg-surface section">
      <div className="wrap">
        <div className="flex items-start gap-4">
          <VsMark className="mt-0.5 sm:mt-1.5" />
          <SectionHeader
            title="Comparer avant d’acheter"
            titleId="comparer-titre"
            intro="iPhone, Galaxy ou Xiaomi : caractéristiques et prix indicatifs, côte à côte."
            stacked
          />
        </div>
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
