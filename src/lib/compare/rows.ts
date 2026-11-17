import { formatFCFA } from "@/lib/format/fcfa";
import type { CompareGroup, ProductDetail } from "@/lib/catalog/types";

/**
 * Lignes du comparateur, déclarées une seule fois par famille (`compare_group`, §5.4, ADR 004) :
 * `{ key, label, format, better, home }`. `home: true` marque les 6 lignes clés de l'accueil
 * (CompareShowcase) ; la page /comparer (étape 5) affiche toutes les lignes. Stockage, prix et
 * garantie sont calculés à partir des variantes et de `warranty_months`.
 */
export type CompareRow = {
  key: string;
  label: string;
  /** Valeur affichée ; `null` quand la donnée manque (cellule « — »). */
  format: (product: ProductDetail) => string | null;
  /** Sens de la « meilleure valeur » (étape 5) ; `null` si la ligne ne se classe pas. */
  better: "higher" | "lower" | null;
  home: boolean;
};

const decimal = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
/** Diagonale d’écran : deux décimales, comme les fiches officielles (6,83 pouces). */
const inches = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
const COMPAT_LABELS = { ios: "iPhone (iOS)", android: "Android" } as const;

function autonomy(hours: number | undefined) {
  if (hours === undefined) return null;
  // Affichée en jours au-delà de 72 h (§5.4).
  return hours > 72 ? `${Math.round(hours / 24)} jours` : `${decimal.format(hours)} h`;
}

/** Capacité de stockage : en To à partir de 1 024 Go (`1024` → « 1 To »). */
export function formatStorage(gb: number) {
  return gb >= 1024 && gb % 1024 === 0 ? `${gb / 1024} To` : `${gb} Go`;
}

function yesNo(value: boolean | undefined) {
  return value === undefined ? null : value ? "Oui" : "Non";
}

/** Libellé lisible de la compatibilité (`ios`, `android`). */
export function formatCompat(compat: ProductDetail["compat"]) {
  return compat.length ? compat.map((code) => COMPAT_LABELS[code]).join(" · ") : null;
}

const rows = {
  price: {
    key: "price",
    label: "Prix indicatif",
    format: (p) => (p.min_price_fcfa === null ? null : `Dès ${formatFCFA(p.min_price_fcfa)}`),
    better: "lower",
  },
  screen: {
    key: "screen",
    label: "Écran",
    format: (p) =>
      [
        p.specs.screen_size_in ? `${inches.format(p.specs.screen_size_in)} pouces` : null,
        p.specs.screen_tech,
      ]
        .filter(Boolean)
        .join(" ") || null,
    better: null,
  },
  refresh: {
    key: "refresh",
    label: "Fréquence d’affichage",
    format: (p) => (p.specs.refresh_hz ? `${p.specs.refresh_hz} Hz` : null),
    better: "higher",
  },
  chip: { key: "chip", label: "Puce", format: (p) => p.specs.chip ?? null, better: null },
  autonomy: {
    key: "autonomy",
    label: "Autonomie indicative",
    format: (p) => autonomy(p.specs.autonomy_hours),
    better: "higher",
  },
  storage: {
    key: "storage",
    label: "Stockage",
    format: (p) => {
      const sizes = [...new Set(p.variants.flatMap((v) => (v.storage_gb ? [v.storage_gb] : [])))];
      return sizes.length
        ? sizes
            .sort((a, b) => a - b)
            .map(formatStorage)
            .join(" · ")
        : null;
    },
    better: "higher",
  },
  weight: {
    key: "weight",
    label: "Poids",
    format: (p) => (p.specs.weight_g ? `${decimal.format(p.specs.weight_g)} g` : null),
    better: "lower",
  },
  camera: {
    key: "camera",
    label: "Appareil photo principal",
    format: (p) => (p.specs.main_camera_mp ? `${p.specs.main_camera_mp} Mpx` : null),
    better: "higher",
  },
  charging: {
    key: "charging",
    label: "Charge rapide",
    format: (p) => (p.specs.charging_w ? `${p.specs.charging_w} W` : null),
    better: "higher",
  },
  ip: { key: "ip", label: "Étanchéité", format: (p) => p.specs.ip_rating ?? null, better: null },
  fiveG: { key: "5g", label: "5G", format: (p) => yesNo(p.specs.has_5g), better: null },
  anc: {
    key: "anc",
    label: "Réduction de bruit active",
    format: (p) => yesNo(p.specs.has_anc),
    better: null,
  },
  compat: {
    key: "compat",
    label: "Compatibilité",
    format: (p) => formatCompat(p.compat),
    better: null,
  },
  warranty: {
    key: "warranty",
    label: "Garantie indiquée",
    format: (p) => `${p.warranty_months} mois`,
    better: "higher",
  },
} satisfies Record<string, Omit<CompareRow, "home">>;

type RowKey = keyof typeof rows;

function pick(keys: readonly RowKey[], home: readonly RowKey[]): CompareRow[] {
  return keys.map((key) => ({ ...rows[key], home: home.includes(key) }));
}

export const compareRows: Record<CompareGroup, readonly CompareRow[]> = {
  phones: pick(
    [
      "price",
      "screen",
      "refresh",
      "chip",
      "autonomy",
      "storage",
      "weight",
      "camera",
      "charging",
      "ip",
      "fiveG",
      "compat",
      "warranty",
    ],
    ["price", "screen", "chip", "autonomy", "camera", "fiveG"],
  ),
  audio: pick(
    ["price", "anc", "autonomy", "ip", "compat", "warranty"],
    ["price", "anc", "autonomy", "ip", "compat", "warranty"],
  ),
  wearables: pick(
    ["price", "screen", "chip", "autonomy", "weight", "ip", "compat", "warranty"],
    ["price", "screen", "autonomy", "ip", "compat", "warranty"],
  ),
};

/** Les 6 lignes clés d'une famille, pour l'accueil. */
export function homeRows(group: CompareGroup): CompareRow[] {
  return compareRows[group].filter((row) => row.home);
}
