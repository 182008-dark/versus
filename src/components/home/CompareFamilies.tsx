"use client";

import { useState, type ReactNode } from "react";
import { PillGroup } from "@/components/ui/PillGroup";

export type CompareFamily = { value: string; label: string; panel: ReactNode };

/**
 * Onglets de famille du comparateur d'accueil (maquette : `.pills` « Choisir une catégorie »),
 * îlot client minimal : les tableaux sont rendus par le serveur ; seul le choix de la famille
 * est ici. Sans JavaScript, la première famille (Smartphones) reste affichée.
 */
export function CompareFamilies({ families }: { families: readonly CompareFamily[] }) {
  const [value, setValue] = useState(families[0]?.value ?? "");
  return (
    <>
      <PillGroup
        label="Choisir une catégorie"
        defaultValue={value}
        onChange={setValue}
        options={families.map(({ value: v, label }) => ({ value: v, label }))}
      />
      {families.map((family) => (
        <div key={family.value} hidden={family.value !== value} className="mt-7">
          {family.panel}
        </div>
      ))}
    </>
  );
}
