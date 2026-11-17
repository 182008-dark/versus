import type { CategorySlug } from "@/lib/catalog/types";

/** Libellés lisibles des catégories (identiques aux noms du catalogue, vérifié par un test). */
const LABELS: Record<CategorySlug, string> = {
  smartphones: "Smartphones",
  ecouteurs: "Écouteurs",
  montres: "Montres",
  bracelets: "Bracelets connectés",
};

/** Libellé d'une catégorie pour l'interface : « Écouteurs », jamais le slug « ecouteurs ». */
export function categoryLabel(slug: CategorySlug): string {
  return LABELS[slug];
}
