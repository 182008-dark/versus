import type { Metadata } from "next";
import Link from "next/link";
import { routeFor } from "@/config/site";

export const metadata: Metadata = {
  title: "Crédits",
  description: "Origine des visuels de produits et des polices utilisés par VERSUS.",
};

// Repris de public/products/SOURCES.md (visuels téléchargés le 12/11/2026).
const productVisuals = [
  { file: "ip18.png", product: "iPhone 18 Pro (bordeaux)", brand: "Apple", source: "apple.com" },
  { file: "aw12.png", product: "Apple Watch Series 12", brand: "Apple", source: "apple.com" },
  { file: "ap5.png", product: "AirPods 5", brand: "Apple", source: "apple.com" },
  { file: "a57.png", product: "Galaxy A57 5G (Icy Blue)", brand: "Samsung", source: "samsung.com" },
  { file: "gb4.png", product: "Galaxy Buds4 (blanc)", brand: "Samsung", source: "samsung.com" },
  { file: "gw9.png", product: "Galaxy Watch9 (graphite)", brand: "Samsung", source: "samsung.com" },
  { file: "rn15.png", product: "Redmi Note 15 Pro+ 5G", brand: "Xiaomi", source: "mi.com" },
  { file: "rw6.png", product: "Redmi Watch 6 (noir)", brand: "Xiaomi", source: "mi.com" },
  { file: "sb10.png", product: "Xiaomi Smart Band 10", brand: "Xiaomi", source: "mi.com" },
] as const;

export default function CreditsPage() {
  const accueil = routeFor("accueil");

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-16 leading-relaxed">
      <h1 className="text-4xl font-extrabold">Crédits</h1>
      <p className="mt-2 text-sm text-ink-muted">Version provisoire.</p>

      <h2 className="mt-10 text-2xl font-bold">Visuels des produits</h2>
      <p className="mt-3">
        Visuels officiels des marques, utilisés pour un projet pédagogique non commercial. Ils
        appartiennent à leurs marques respectives. Ils ont été recadrés, détourés et réduits
        (900&nbsp;px au plus).
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Origine des visuels de produits</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="py-2 pr-4 font-semibold">
                Produit
              </th>
              <th scope="col" className="py-2 pr-4 font-semibold">
                Marque
              </th>
              <th scope="col" className="py-2 pr-4 font-semibold">
                Source
              </th>
              <th scope="col" className="py-2 font-semibold">
                Fichier
              </th>
            </tr>
          </thead>
          <tbody>
            {productVisuals.map((visual) => (
              <tr key={visual.file} className="border-b border-line">
                <td className="py-2 pr-4">{visual.product}</td>
                <td className="py-2 pr-4">{visual.brand}</td>
                <td className="py-2 pr-4">{visual.source}</td>
                <td className="py-2 font-mono text-xs">{visual.file}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-2xl font-bold">Polices</h2>
      <p className="mt-3">
        Inter (Rasmus Andersson) et Plus Jakarta Sans (Tokotype), sous licence SIL Open Font License
        1.1, servies par le site via next/font.
      </p>

      <h2 className="mt-10 text-2xl font-bold">Marques</h2>
      <p className="mt-3">
        Apple, Samsung et Xiaomi sont des marques de leurs propriétaires respectifs. Aucun logo
        officiel n&apos;est utilisé.
      </p>

      {accueil ? (
        <p className="mt-12">
          <Link href={accueil} className="font-semibold underline underline-offset-4">
            Retour à l&apos;accueil
          </Link>
        </p>
      ) : null}
    </article>
  );
}
