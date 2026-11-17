import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/product/ProductView";
import { getCatalog, getCategories, getProduct } from "@/lib/catalog/queries";

/**
 * Fiche produit entièrement statique (§3.2). Avec Cache Components, un slug absent de
 * `generateStaticParams` recevrait sinon la coquille prérendue (HTTP 200) avant que `notFound()`
 * ne s'exécute : `'navigation'` fait attendre la page complète à la première requête, donc un
 * produit inconnu répond 404 dès la première visite (guide ensureStatic de Next 16).
 */
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  return (await getCatalog()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/produit/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return product
    ? {
        title: product.name,
        description: `${product.tagline} Prix indicatif en FCFA. Projet pédagogique, aucune vente réelle.`,
      }
    : {};
}

export default async function ProductPage({ params }: PageProps<"/produit/[slug]">) {
  const { slug } = await params;
  const [product, categories] = await Promise.all([getProduct(slug), getCategories()]);
  if (!product) notFound();
  const category = categories.find((item) => item.slug === product.category_slug);

  return <ProductView product={product} categoryName={category?.name ?? product.category_slug} />;
}
