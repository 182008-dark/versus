import { Fragment } from "react";
import { BrandCard } from "@/components/home/BrandCard";
import { CategoryNav } from "@/components/home/CategoryNav";
import { CompareShowcase } from "@/components/home/CompareShowcase";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { PromoTile } from "@/components/home/PromoTile";
import { QuizTeaser } from "@/components/home/QuizTeaser";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductRail, type RailLink } from "@/components/product/ProductRail";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { VsMark } from "@/components/ui/VsMark";
import { brandHref, routeFor } from "@/config/site";
import { brandShowcase, priceSpan, productsOfBrand } from "@/lib/catalog/brand-page";
import { isNew } from "@/lib/catalog/is-new";
import { getBrands, getCatalog, getCategories, getHome } from "@/lib/catalog/queries";
import { productCount } from "@/lib/catalog/summary";
import { getToday } from "@/lib/catalog/today";

/**
 * Accueil (refonte, §3.1, lot 4) : hero manuel, catégories, 3 tuiles, Nouveautés, « Parcourir
 * par marque », comparateur, réassurance. Les produits viennent de `home_slots` ; les comptes,
 * prix d'entrée et vignettes de marque sont calculés à partir du catalogue, jamais écrits en dur.
 */
export default async function HomePage() {
  const [home, catalog, brands, categories, today] = await Promise.all([
    getHome(),
    getCatalog(),
    getBrands(),
    getCategories(),
    getToday(),
  ]);
  const shop = routeFor("boutique");
  // Vignettes de marque : sans les produits déjà mis en avant par le hero et les tuiles.
  const featured = new Set([...home.hero, ...home.tile].map(({ product }) => product.code));

  const railLinks: Record<string, RailLink> = {};
  if (shop) railLinks.all = { href: shop, label: `Tout le catalogue (${catalog.length})` };
  for (const brand of brands) {
    const href = brandHref(brand.slug);
    const count = productsOfBrand(catalog, brand.slug).length;
    if (href)
      railLinks[brand.slug] = { href, label: `Voir les ${productCount(count)} ${brand.name}` };
  }

  return (
    <>
      <h1 className="sr-only">VERSUS, Apple, Samsung et Xiaomi au Togo</h1>
      <HeroCarousel entries={home.hero} />
      <CategoryNav categories={categories} products={catalog} />

      <section aria-label="Sélection de produits" className="promo-grid">
        {home.tile.map((entry, index) => (
          <PromoTile
            key={entry.product.code}
            entry={entry}
            isNew={isNew(entry.product, today)}
            featured={index === 0}
          />
        ))}
      </section>

      <section id="nouveautes" aria-labelledby="nouveautes-titre" className="section">
        <div className="wrap">
          <ProductRail
            id="nouveautes"
            label="Nouveautés et produits du catalogue"
            heading={
              <SectionHeader
                title="Nouveautés"
                titleId="nouveautes-titre"
                intro="Les dernières sorties. Prix et caractéristiques indicatifs."
                stacked
              />
            }
            links={railLinks}
            filters={[
              { value: "all", label: "Toutes" },
              ...brands.map((brand) => ({ value: brand.slug, label: brand.name })),
            ]}
            items={home.rail.map(({ product }) => ({
              key: product.code,
              brand: product.brand_slug,
              card: (
                <ProductCard product={{ ...product, is_new: isNew(product, today) }} wholeCard />
              ),
            }))}
          />
        </div>
      </section>

      <section id="marques" aria-labelledby="marques-titre" className="pb-section">
        <div className="wrap mb-6 sm:mb-8">
          <SectionHeader title="Parcourir par marque" titleId="marques-titre" />
        </div>
        <div className="brand-grid">
          {brands.flatMap((brand, index) => {
            const href = brandHref(brand.slug);
            if (!href) return [];
            const own = productsOfBrand(catalog, brand.slug);
            return (
              <Fragment key={brand.slug}>
                {index > 0 ? (
                  <div className="brand-vs">
                    <VsMark size="sm" className="md:hidden" />
                    <VsMark className="max-md:hidden" />
                  </div>
                ) : null}
                <BrandCard
                  brand={brand}
                  href={href}
                  products={brandShowcase(catalog, categories, brand.slug, featured)}
                  count={own.length}
                  minPrice={priceSpan(own)?.min ?? null}
                />
              </Fragment>
            );
          })}
        </div>
      </section>

      <CompareShowcase entries={home.compare} categories={categories} />
      <QuizTeaser />
      <FeatureGrid />
    </>
  );
}
