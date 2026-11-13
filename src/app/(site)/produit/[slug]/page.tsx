import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/product/ProductView";
import { getProduct } from "@/lib/catalog/queries";
import { products } from "@/data/catalog";

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
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
  const product = await getProduct(slug);
  if (!product) notFound();

  return <ProductView product={product} />;
}
