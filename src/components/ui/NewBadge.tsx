import { Badge, type BadgeTone, type LegacyBadgeTone } from "./Badge";

/**
 * Badge « Nouveau » : capsule accent-soft (maquette : `.c-new` orange Apple, remplacé par
 * l'accent VERSUS). Son affichage dépend de `isNew(product, today)` à partir de l'étape 3.
 */
export function NewBadge({ tone = "new" }: { tone?: BadgeTone | LegacyBadgeTone }) {
  return <Badge tone={tone}>Nouveau</Badge>;
}
