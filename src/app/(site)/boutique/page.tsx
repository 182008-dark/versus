import type { Metadata } from "next";
import { ProductCard } from "@/components/product/ProductCard";
import { BrandMark } from "@/components/ui/BrandMark";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { brandHref, routeFor } from "@/config/site";
import { getBrands, getCatalog, getCategories } from "@/lib/catalog/queries";
import { isNew } from "@/lib/catalog/is-new";
import { brandNames, productCount } from "@/lib/catalog/summary";
import { getToday } from "@/lib/catalog/today";

export async function generateMetadata(): Promise<Metadata> {
  const [products, brands] = await Promise.all([getCatalog(), getBrands()]);
  return {
    title: "Boutique",
    description: `Les ${productCount(products.length)} ${brandNames(brands)} de la boutique fictive VERSUS.`,
  };
}

export default async function ShopPage() {
  const [products, categories, brands] = await Promise.all([
    getCatalog(),
    getCategories(),
    getBrands(),
  ]);
  const today = await getToday();
  const home = routeFor("accueil");

  return (
    <div className="wrap py-14 sm:py-20">
      <Eyebrow>La boutique</Eyebrow>
      <h1 className="mt-3 text-display-h2">Les produits VERSUS.</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        {productCount(products.length)} pour découvrir les univers {brandNames(brands)}. Prix
        indicatifs en FCFA, projet pédagogique sans vente réelle.
      </p>
      <nav aria-label="Marques" className="mt-6">
        <ul className="flex flex-wrap items-center gap-x-5">
          {brands.map((brand) => {
            const href = brandHref(brand.slug);
            return href ? (
              <li key={brand.slug}>
                <BrandMark brand={brand.slug} size="lead" href={href} />
              </li>
            ) : null;
          })}
        </ul>
      </nav>
      <nav aria-label="Catégories de la boutique" className="mt-5 flex flex-wrap gap-2">
        {categories.map((category) => (
          <a
            key={category.slug}
            href={`#${category.slug}`}
            className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-sm font-medium state-hover:border-ink"
          >
            {category.name}
          </a>
        ))}
      </nav>
      <div className="mt-12 space-y-14">
        {categories.map((category) => {
          const items = products.filter((product) => product.category_slug === category.slug);
          if (!items.length) return null;
          return (
            <section
              key={category.slug}
              id={category.slug}
              aria-labelledby={`${category.slug}-title`}
            >
              <div className="mb-6">
                <h2
                  id={`${category.slug}-title`}
                  className="text-3xl font-extrabold tracking-tight"
                >
                  {category.name}
                </h2>
                <p className="mt-2 text-muted">{category.intro}</p>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((product) => (
                  <li key={product.code}>
                    <ProductCard product={{ ...product, is_new: isNew(product, today) }} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      {home ? (
        <p className="mt-14">
          <a href={home} className="font-semibold text-accent underline underline-offset-4">
            Retour à l’accueil
          </a>
        </p>
      ) : null}
    </div>
  );
}
