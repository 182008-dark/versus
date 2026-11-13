import { ProductVisual } from "@/components/product/ProductVisual";
import { Price } from "@/components/ui/Price";
import { ScrollRegion } from "@/components/ui/ScrollRegion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { productHref } from "@/config/site";
import type { CatalogProduct } from "@/lib/catalog/types";

const rows = [
  {
    label: "Prix indicatif",
    value: (product: CatalogProduct) => <Price amount={product.min_price_fcfa} />,
  },
  {
    label: "Écran",
    value: (product: CatalogProduct) =>
      product.specs.screen_size_in
        ? `${product.specs.screen_size_in}″ ${product.specs.screen_tech ?? ""}`
        : "—",
  },
  { label: "Puce", value: (product: CatalogProduct) => product.specs.chip ?? "—" },
  {
    label: "Autonomie indicative",
    value: (product: CatalogProduct) =>
      product.specs.autonomy_hours ? `${product.specs.autonomy_hours} h` : "—",
  },
  {
    label: "Appareil photo principal",
    value: (product: CatalogProduct) =>
      product.specs.main_camera_mp ? `${product.specs.main_camera_mp} Mpx` : "—",
  },
  { label: "5G", value: (product: CatalogProduct) => (product.specs.has_5g ? "Oui" : "—") },
];

export function CompareShowcase({ products }: { products: readonly CatalogProduct[] }) {
  return (
    <section id="comparer" className="bg-surface section">
      <div className="wrap">
        <SectionHeader
          eyebrow="Comparateur"
          title="Comparez avant d’acheter."
          intro="Quelques repères pour comparer les trois smartphones à la une. Les caractéristiques et prix sont indicatifs."
        />
        <ScrollRegion
          label="Comparaison des smartphones à la une"
          className="mt-8 bg-bg p-2 sm:p-4"
        >
          <table className="compare-table">
            <caption className="sr-only">
              Comparaison des caractéristiques des smartphones VERSUS
            </caption>
            <thead>
              <tr>
                <th scope="col" className="compare-row-label">
                  Caractéristique
                </th>
                {products.map((product) => (
                  <th scope="col" key={product.code} className="compare-product">
                    <ProductVisual
                      product={product}
                      sizes="150px"
                      className="mx-auto h-[120px] w-[100px]"
                    />
                    <span className="mt-2 block text-xs font-semibold tracking-wider text-brand-ink uppercase">
                      {product.brand_name}
                    </span>
                    <span className="mt-1 block font-display text-base font-bold">
                      {product.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="compare-row-label">
                    {row.label}
                  </th>
                  {products.map((product) => (
                    <td key={product.code}>{row.value(product)}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row" className="compare-row-label">
                  Découvrir
                </th>
                {products.map((product) => (
                  <td key={product.code}>
                    <a
                      className="text-sm font-semibold text-accent underline underline-offset-4"
                      href={productHref(product.slug)}
                    >
                      Voir le produit
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </ScrollRegion>
      </div>
    </section>
  );
}
