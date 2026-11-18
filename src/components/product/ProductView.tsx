import { BrandMark } from "@/components/ui/BrandMark";
import { Price } from "@/components/ui/Price";
import { buttonClasses } from "@/components/ui/button-styles";
import { brandHref, routeFor } from "@/config/site";
import type { ProductDetail } from "@/lib/catalog/types";
import { initialVariant, variantViews } from "@/lib/catalog/variant-options";
import { compareRows } from "@/lib/compare/rows";
import { ProductVisual } from "./ProductVisual";
import { VariantPicker } from "./VariantPicker";

/**
 * Fiche produit (§4.3) : visuel, nom, accroche, prix minimal, choix de la variante et ajout au
 * panier (îlot VariantPicker, étape 5 : seules les variantes actives comptent, et le serveur
 * calcule pour chacune ses options, son texte et son prix rendu),
 * caractéristiques (lignes de `lib/compare/rows.ts`), garantie et mention
 * « Prix indicatifs, aucune vente réelle ». Toutes les données arrivent en props : la même vue
 * servira à l'aperçu admin (étape 8). Le nom de la marque mène à sa page (refonte, lot 3).
 */
export function ProductView({
  product,
  categoryName,
}: {
  product: ProductDetail;
  categoryName: string;
}) {
  const specs = compareRows[product.compare_group].filter(
    (row) => row.key !== "price" && row.key !== "warranty",
  );
  const variants = product.variants.filter((variant) => variant.is_active);

  return (
    <article className="product-view wrap section">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <div>
          <div data-brand={product.brand_slug} className="rounded-tile bg-brand-ground p-8">
            <ProductVisual
              product={product}
              priority
              noUpscale
              sizes="(max-width: 900px) 85vw, 46vw"
              className={`mx-auto flex h-[min(70vw,520px)] max-h-[520px] w-full items-center justify-center ${product.visual_kind === "band" ? "max-w-[120px]" : "max-w-[460px]"}`}
            />
          </div>
          {/* Une seule photo par produit (une par variante à l'étape 4) : on le dit. */}
          {new Set(variants.map((variant) => variant.color_slug)).size > 1 ? (
            <p className="mt-3 text-center text-xs text-muted">
              Photo d’un seul coloris : la pastille montre le coloris choisi.
            </p>
          ) : null}
        </div>
        <div>
          <p className="flex flex-wrap items-center gap-x-2 text-meta text-muted-strong">
            <BrandMark
              brand={product.brand_slug}
              href={brandHref(product.brand_slug) ?? undefined}
            />
            <span aria-hidden="true">·</span>
            <span>{categoryName}</span>
          </p>
          <h1 className="mt-3 text-display-h2">{product.name}</h1>
          <p className="mt-4 text-xl leading-snug font-semibold">{product.tagline}</p>
          {product.description ? (
            <p className="mt-3 text-lg leading-relaxed text-muted">{product.description}</p>
          ) : null}
          <p className="mt-6 text-lg font-semibold">
            {product.min_price_fcfa !== null ? (
              <Price amount={variants.map((variant) => variant.price_fcfa)} />
            ) : (
              "Prix indisponible"
            )}
          </p>
          <p className="mt-2 text-sm text-muted">
            Garantie indiquée : {product.warranty_months} mois
          </p>
          {variants.length > 0 ? (
            <VariantPicker
              initialSku={initialVariant(variants).sku}
              cartHref={routeFor("panier")}
              buttonClassName={buttonClasses({ size: "lg", className: "w-full sm:w-auto" })}
              views={variantViews(product.name, variants).map((view) => ({
                ...view,
                price: <Price amount={view.price_fcfa} size="lead" />,
              }))}
            />
          ) : null}
          <h2 className="mt-8 text-base font-bold">Caractéristiques</h2>
          <dl className="mt-3 grid grid-cols-2 gap-4 border-t border-line-soft pt-4">
            {specs.map((row) => (
              <div key={row.key}>
                <dt className="text-sm text-muted">{row.label}</dt>
                <dd className="mt-1 font-semibold">{row.format(product) ?? "—"}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted">{product.specs.specs_note}</p>
          <p className="mt-8 rounded-option bg-surface p-4 text-sm leading-relaxed text-muted">
            Prix indicatifs, aucune vente réelle. Projet pédagogique : les prix en FCFA et les
            caractéristiques affichées sont donnés à titre indicatif.
          </p>
        </div>
      </div>
    </article>
  );
}
