import { BrandCard } from "@/components/home/BrandCard";
import { CategoryNav } from "@/components/home/CategoryNav";
import { CompareShowcase } from "@/components/home/CompareShowcase";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { PromoTile } from "@/components/home/PromoTile";
import { ProductRail } from "@/components/product/ProductRail";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { routeFor } from "@/config/site";
import { getCategories, getCatalog, getHome } from "@/lib/catalog/queries";
import { isNew } from "@/lib/catalog/is-new";
import { getToday } from "@/lib/catalog/today";

export default async function HomePage() {
  const [home, allProducts, categories] = await Promise.all([
    getHome(),
    getCatalog(),
    getCategories(),
  ]);
  const today = await getToday();
  const byCode = new Map(allProducts.map((product) => [product.code, product]));
  const withNewFlag = (product: (typeof allProducts)[number]) => ({
    ...product,
    is_new: isNew(product, today),
  });
  const railHref = routeFor("boutique");
  const brands = [
    { key: "apple", tagline: "iPhone, AirPods et Apple Watch.", visual: byCode.get("aw12") },
    {
      key: "samsung",
      tagline: "Galaxy A, Galaxy Buds et Galaxy Watch.",
      visual: byCode.get("gb4"),
    },
    { key: "xiaomi", tagline: "Redmi Note, Redmi Watch et Smart Band.", visual: byCode.get("rw6") },
  ] as const;
  const brandProducts = brands.flatMap(({ key, tagline, visual }) =>
    visual ? [{ brand: key, tagline, visual }] : [],
  );

  return (
    <>
      <h1 className="sr-only">VERSUS, Apple, Samsung et Xiaomi au Togo</h1>
      <HeroCarousel slides={home.hero} today={today} />
      <CategoryNav categories={categories} />

      <section aria-label="Sélection de produits" className="promo-grid">
        {home.tiles.map((product) => (
          <PromoTile
            key={product.code}
            product={withNewFlag(product)}
            featured={product.code === "a57"}
          />
        ))}
      </section>

      <section id="nouveautes" className="section">
        <div className="wrap">
          <SectionHeader
            eyebrow="Nouveautés"
            title="Les derniers arrivés."
            intro="Découvrez la sélection VERSUS. Les prix et caractéristiques sont indicatifs."
            href={railHref ?? undefined}
            linkLabel="Voir la boutique"
          />
          <div className="mt-7">
            <ProductRail
              products={home.rail.map(withNewFlag)}
              label="Nouveautés et produits du catalogue"
            />
          </div>
        </div>
      </section>

      <section className="brand-section">
        <div className="wrap mb-8">
          <SectionHeader
            eyebrow="Univers de marque"
            title="Entrez chez votre marque."
            intro="Trois univers, une seule boutique."
          />
        </div>
        <div className="brand-grid">
          {brandProducts.map(({ brand, tagline, visual }) => (
            <BrandCard key={brand} brand={brand} tagline={tagline} visual={visual} />
          ))}
        </div>
      </section>

      <CompareShowcase products={home.compare} />
      <FeatureGrid />
    </>
  );
}
