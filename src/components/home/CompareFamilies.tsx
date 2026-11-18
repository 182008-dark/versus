import type { ReactNode } from "react";
import { RadioPills } from "@/components/ui/RadioPills";

export type CompareFamily = { value: string; label: string; panel: ReactNode };

/**
 * Familles du comparateur d'accueil (maquette : `.pills` « Choisir une catégorie »), sans
 * JavaScript (refonte §4.7) : des pastilles radio (RadioPills) et un tableau par famille ; le CSS
 * n'affiche que celui de la famille cochée (`[data-compare-families]:has(…)`, globals.css).
 * Familles reconnues par le CSS : `phones`, `audio`, `wearables`. Smartphones d'abord.
 */
export function CompareFamilies({ families }: { families: readonly CompareFamily[] }) {
  return (
    <div data-compare-families>
      <RadioPills
        legend="Choisir une catégorie"
        name="comparer-famille"
        defaultValue={families[0]?.value ?? ""}
        options={families.map(({ value, label }) => ({ value, label }))}
      />
      {families.map((family) => (
        <div key={family.value} data-family={family.value} className="mt-7">
          {family.panel}
        </div>
      ))}
    </div>
  );
}
