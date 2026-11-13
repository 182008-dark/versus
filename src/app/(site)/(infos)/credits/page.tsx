import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";
import { ScrollRegion } from "@/components/ui/ScrollRegion";

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
  return (
    <InfoPage title="Crédits">
      <h2>Visuels des produits</h2>
      <p>
        Visuels officiels des marques, utilisés pour un projet pédagogique non commercial. Ils
        appartiennent à leurs marques respectives. Ils ont été recadrés, détourés et réduits
        (900&nbsp;px au plus).
      </p>
      <ScrollRegion label="Origine des visuels de produits">
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
      </ScrollRegion>

      <h2>Polices</h2>
      <p>
        Inter (Rasmus Andersson) et Plus Jakarta Sans (Tokotype), sous licence SIL Open Font License
        1.1, servies par le site via next/font.
      </p>

      <h2>Marques</h2>
      <p>
        Apple, Samsung et Xiaomi sont des marques de leurs propriétaires respectifs. Aucun logo
        officiel n&apos;est utilisé.
      </p>
    </InfoPage>
  );
}
