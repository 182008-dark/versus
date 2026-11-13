import { Badge } from "@/components/ui/Badge";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Price } from "@/components/ui/Price";
import { ProductVisual } from "./ProductVisual";
import type { CatalogProduct } from "@/lib/catalog/types";

export function ProductView({ product }: { product: CatalogProduct }) {
  return (
    <article className="product-view wrap section">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <div data-brand={product.brand_slug} className="rounded-tile bg-brand-ground p-8">
          <ProductVisual
            product={product}
            priority
            sizes="(max-width: 768px) 85vw, 46vw"
            className={`mx-auto flex h-[min(70vw,520px)] max-h-[520px] w-full ${product.visual_kind === "band" ? "max-w-[120px]" : "max-w-[460px]"}`}
          />
        </div>
        <div>
          <Eyebrow>
            {product.brand_name} · {product.category_slug}
          </Eyebrow>
          <h1 className="mt-3 text-display-h2">{product.name}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">{product.description}</p>
          <p className="mt-6 text-lg font-semibold">
            À partir de <Price amount={product.min_price_fcfa} />
          </p>
          <p className="mt-2 text-sm text-muted">
            {product.warranty_months} mois de garantie indiquée
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <Badge
                key={variant.sku}
                tone={variant.stock > 0 ? "neutral" : "accent"}
                className="product-variant !whitespace-normal"
              >
                {variant.color_name} · <Price amount={variant.price_fcfa} />
                {variant.stock === 0 ? " · Indisponible" : ""}
              </Badge>
            ))}
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-line-soft pt-6">
            <div>
              <dt className="text-sm text-muted">Écran</dt>
              <dd className="mt-1 font-semibold">
                {product.specs.screen_size_in ? `${product.specs.screen_size_in}″ ` : ""}
                {product.specs.screen_tech ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Puce</dt>
              <dd className="mt-1 font-semibold">{product.specs.chip ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Autonomie indicative</dt>
              <dd className="mt-1 font-semibold">
                {product.specs.autonomy_hours ? `${product.specs.autonomy_hours} h` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Compatibilité</dt>
              <dd className="mt-1 font-semibold">{product.compat.join(" · ")}</dd>
            </div>
          </dl>
          <p className="mt-8 rounded-option bg-surface p-4 text-sm leading-relaxed text-muted">
            Projet pédagogique : aucune vente réelle. Prix indicatifs en FCFA, susceptibles de
            varier. Les caractéristiques affichées sont données à titre indicatif.
          </p>
        </div>
      </div>
    </article>
  );
}
