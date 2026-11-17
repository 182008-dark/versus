import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";
import { ScrollRegion } from "@/components/ui/ScrollRegion";
import { productVisualSources } from "@/data/product-visuals";
import { getBrands } from "@/lib/catalog/queries";

export const metadata: Metadata = {
  title: "Crédits",
  description: "Origine des visuels de produits et des polices utilisés par VERSUS.",
};

// Dates de téléchargement en clair, fuseau de Lomé (§3.4) : « 17/11/2026 ».
const downloadDate = new Intl.DateTimeFormat("fr-FR", { timeZone: "Africa/Lome" });

export default async function CreditsPage() {
  const brands = await getBrands();
  const brandName = (slug: string) => brands.find((brand) => brand.slug === slug)?.name ?? slug;

  return (
    <InfoPage title="Crédits">
      <h2>Visuels des produits</h2>
      <p>
        Visuels officiels des marques, utilisés pour un projet pédagogique non commercial. Ils
        appartiennent à leurs marques respectives (visuels © leurs fabricants) et sont retirés sur
        simple demande. Ils ont été détourés si besoin, recadrés avec une marge homogène, réduits
        (900&nbsp;px au plus) et compressés. Détail par fichier : public/products/SOURCES.md.
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
              <th scope="col" className="py-2 pr-4 font-semibold">
                Téléchargé le
              </th>
              <th scope="col" className="py-2 font-semibold">
                Fichier
              </th>
            </tr>
          </thead>
          <tbody>
            {productVisualSources.map((visual) => (
              <tr key={visual.code} className="border-b border-line">
                <td className="py-2 pr-4">{visual.label}</td>
                <td className="py-2 pr-4">{brandName(visual.brand)}</td>
                <td className="py-2 pr-4">{visual.site}</td>
                <td className="py-2 pr-4 whitespace-nowrap">
                  {downloadDate.format(new Date(`${visual.downloaded}T12:00:00Z`))}
                </td>
                <td className="py-2 font-mono text-xs">{visual.code}.png</td>
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
