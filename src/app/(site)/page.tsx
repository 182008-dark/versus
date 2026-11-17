import { BrandCard } from "@/components/home/BrandCard";
import { CategoryNav } from "@/components/home/CategoryNav";
import { CompareShowcase } from "@/components/home/CompareShowcase";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { PromoTile } from "@/components/home/PromoTile";
import { QuizTeaser } from "@/components/home/QuizTeaser";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductRail } from "@/components/product/ProductRail";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { routeFor, type RouteKey } from "@/config/site";
import { brandCardThemes, type Brand } from "@/lib/brand-themes";
import { getBrands, getCatalog, getCategories, getHome } from "@/lib/catalog/queries";
import { isNew } from "@/lib/catalog/is-new";
import { getToday } from "@/lib/catalog/today";

/** Cible des cartes de marque : `/marques/[marque]` dès l'étape 4, la boutique avant. */
const brandRoutes: Record<Brand, RouteKey> = {
  apple: "marqueApple",
  samsung: "marqueSamsung",
  xiaomi: "marqueXiaomi",
};

/** Accueil (§4.5, ordre final) : tout vient de `home_slots`, des marques et des catégories. */
export default async function HomePage() {
  const [home, catalog, brands, categories, today] = await Promise.all([
    getHome(),
    getCatalog(),
    getBrands(),
    getCategories(),
    getToday(),
  ]);
  const byCode = new Map(catalog.map((product) => [product.code, product]));
  const shop = routeFor("boutique");

  return (
    <>
      <h1 className="sr-only">VERSUS, Apple, Samsung et Xiaomi au Togo</h1>
      <HeroCarousel entries={home.hero} />
      <CategoryNav categories={categories} />

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
          <SectionHeader
            eyebrow="Nouveautés"
            title="Les derniers arrivés."
            titleId="nouveautes-titre"
            intro="Faites défiler la sélection VERSUS. Prix et caractéristiques indicatifs."
            href={shop ?? undefined}
            linkLabel="Voir la boutique"
          />
          <div className="mt-8">
            <ProductRail
              label="Nouveautés et produits du catalogue"
              filters={[
                { value: "all", label: "Toutes" },
                ...brands.map((brand) => ({ value: brand.slug, label: brand.name })),
              ]}
              items={home.rail.map(({ product }) => ({
                key: product.code,
                brand: product.brand_slug,
                card: <ProductCard product={{ ...product, is_new: isNew(product, today) }} />,
              }))}
            />
          </div>
        </div>
      </section>

      {shop ? (
        <section id="marques" aria-labelledby="marques-titre" className="brand-section">
          <div className="wrap mb-9">
            <SectionHeader
              eyebrow="Univers de marque"
              title="Entrez chez votre marque."
              titleId="marques-titre"
            />
          </div>
          <div className="brand-grid">
            {brands.map((brand) => (
              <BrandCard
                key={brand.slug}
                brand={brand}
                href={routeFor(brandRoutes[brand.slug]) ?? shop}
                visual={byCode.get(brandCardThemes[brand.slug].visual)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <CompareShowcase entries={home.compare} categories={categories} />
      <QuizTeaser />
      <FeatureGrid />
    </>
  );
}
