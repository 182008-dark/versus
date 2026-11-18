import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandBanner } from "@/components/brand/BrandBanner";
import { BrandCompare } from "@/components/brand/BrandCompare";
import { BrandSeeAlso } from "@/components/brand/BrandSeeAlso";
import { BrandSwitcher } from "@/components/brand/BrandSwitcher";
import { CategoryBar } from "@/components/brand/CategoryBar";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { brandHref, routeFor } from "@/config/site";
import {
  brandRangeLabel,
  compareShortcuts,
  featuredProducts,
  findBrand,
  groupByCategory,
  otherBrands,
  priceSpan,
  productsOfBrand,
} from "@/lib/catalog/brand-page";
import { isNew } from "@/lib/catalog/is-new";
import { getBrands, getCatalog, getCategories, getHome } from "@/lib/catalog/queries";
import { productCount } from "@/lib/catalog/summary";
import { getToday } from "@/lib/catalog/today";

/**
 * Pages marque `/marques/apple|samsung|xiaomi` (refonte, lot 3), générées à l'avance pour les
 * trois marques du catalogue, sans JavaScript ajouté. Comme pour les fiches produit,
 * `'navigation'` fait attendre la page complète à la première requête : une marque inconnue
 * répond 404 dès la première visite, au lieu d'une coquille prérendue en 200.
 */
export const ensureStatic = "navigation";

const ALL_ID = "produits";

export async function generateStaticParams() {
  return (await getBrands()).map(({ slug }) => ({ marque: slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/marques/[marque]">): Promise<Metadata> {
  const [{ marque }, brands, catalog] = await Promise.all([params, getBrands(), getCatalog()]);
  const brand = findBrand(brands, marque);
  if (!brand) return {};
  const items = productsOfBrand(catalog, brand.slug);
  return {
    title: brand.name,
    description: `Les ${brandRangeLabel(items.length, priceSpan(items))} de ${brand.name} : ${brand.tagline} Boutique fictive VERSUS, prix indicatifs.`,
  };
}

export default async function BrandPage({ params }: PageProps<"/marques/[marque]">) {
  const [{ marque }, brands, catalog, categories, home, today] = await Promise.all([
    params,
    getBrands(),
    getCatalog(),
    getCategories(),
    getHome(),
    getToday(),
  ]);
  const brand = findBrand(brands, marque);
  if (!brand) notFound();

  const items = productsOfBrand(catalog, brand.slug);
  const groups = groupByCategory(items, categories);
  const others = otherBrands(brands, brand.slug);
  const compareHref = routeFor("comparer") ?? routeFor("comparerAccueil");
  const shortcuts = compareShortcuts(
    home.compare.map((entry) => entry.product),
    brand.slug,
    others.map((other) => other.slug),
  );
  const seeAlso = others.flatMap((other) => {
    const href = brandHref(other.slug);
    const count = catalog.filter((product) => product.brand_slug === other.slug).length;
    return href ? [{ slug: other.slug, name: other.name, href, summary: productCount(count) }] : [];
  });

  return (
    <div className="wrap w-full pt-2 pb-section">
      <Breadcrumb
        items={[{ label: "Accueil", href: routeFor("accueil") }, { label: brand.name }]}
      />
      <BrandBanner
        brand={brand.slug}
        name={brand.name}
        tagline={brand.tagline}
        summary={brandRangeLabel(items.length, priceSpan(items))}
        featured={featuredProducts(groups)}
        switcher={<BrandSwitcher brands={brands} current={brand.slug} />}
      />

      <div id={ALL_ID} className="mt-8 md:scroll-mt-4">
        <CategoryBar brandName={brand.name} groups={groups} total={items.length} allId={ALL_ID} />
        {groups.map(({ category, products }) => (
          <section
            key={category.slug}
            id={category.slug}
            aria-labelledby={`${category.slug}-titre`}
            className="pt-10 sm:pt-12 md:scroll-mt-[76px]"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2
                id={`${category.slug}-titre`}
                className="font-display text-[28px] leading-tight font-bold tracking-[-0.025em] sm:text-[32px]"
              >
                {category.name}
              </h2>
              <p className="text-sm text-muted-strong">{productCount(products.length)}</p>
            </div>
            <ul role="list" className="mt-5 grid-products sm:mt-6">
              {products.map((product) => (
                <li key={product.code}>
                  <ProductCard
                    product={{ ...product, is_new: isNew(product, today) }}
                    layout="adaptive"
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {compareHref ? <BrandCompare shortcuts={shortcuts} href={compareHref} /> : null}
      <BrandSeeAlso links={seeAlso} />
    </div>
  );
}
