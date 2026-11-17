import type { Brand } from "@/lib/brand-themes";

/**
 * Origine des visuels de `public/products` (un par produit, nommé `<code>.png`), reprise de
 * `public/products/SOURCES.md` pour la page /credits. Le test du catalogue vérifie que chaque
 * produit a sa ligne ici et dans SOURCES.md.
 */
export type ProductVisualSource = {
  code: string;
  /** Produit et coloris montrés. */
  label: string;
  brand: Brand;
  /** Site officiel d'où vient le visuel. */
  site: "apple.com" | "samsung.com" | "mi.com";
  /** Date de téléchargement (AAAA-MM-JJ). */
  downloaded: string;
};

const apple = (code: string, label: string, downloaded = "2026-11-17") =>
  ({ code, label, brand: "apple", site: "apple.com", downloaded }) as const;
const samsung = (code: string, label: string, downloaded = "2026-11-17") =>
  ({ code, label, brand: "samsung", site: "samsung.com", downloaded }) as const;
const xiaomi = (code: string, label: string, downloaded = "2026-11-17") =>
  ({ code, label, brand: "xiaomi", site: "mi.com", downloaded }) as const;

export const productVisualSources: readonly ProductVisualSource[] = [
  apple("ipd", "iPhone Duo (blanc stellaire)"),
  apple("ip18", "iPhone 18 Pro (bordeaux)", "2026-11-12"),
  apple("ip17", "iPhone 17 (lavande)"),
  apple("ip17e", "iPhone 17e (rose pastel)"),
  apple("apm2", "AirPods Max 2 (minuit)"),
  apple("app3", "AirPods Pro 3"),
  apple("ap5", "AirPods 5", "2026-11-12"),
  apple("awu4", "Apple Watch Ultra 4 (titane naturel)"),
  apple("aw12", "Apple Watch Series 12", "2026-11-12"),
  apple("awse3", "Apple Watch SE 3 (lumière stellaire)"),
  samsung("zf8", "Galaxy Z Fold8 (lavande)"),
  samsung("s26u", "Galaxy S26 Ultra (violet)"),
  samsung("zfl8", "Galaxy Z Flip8 (rose)"),
  samsung("s26", "Galaxy S26 (violet)"),
  samsung("a57", "Galaxy A57 5G (bleu glacier)", "2026-11-12"),
  samsung("gb4p", "Galaxy Buds4 Pro (noir)"),
  samsung("gb4", "Galaxy Buds4 (blanc)", "2026-11-12"),
  samsung("gwu2", "Galaxy Watch Ultra2 (argent titane)"),
  samsung("gw9", "Galaxy Watch9 (graphite)", "2026-11-12"),
  samsung("gf3", "Galaxy Fit3 (gris)"),
  xiaomi("x17u", "Xiaomi 17 Ultra (noir)"),
  xiaomi("x17", "Xiaomi 17 (noir)"),
  xiaomi("x17tp", "Xiaomi 17T Pro (bleu)"),
  xiaomi("rn15", "Redmi Note 15 Pro+ 5G", "2026-11-12"),
  xiaomi("xb6", "Xiaomi Buds 6"),
  xiaomi("rb8", "Redmi Buds 8 (noir)"),
  xiaomi("xws5", "Xiaomi Watch S5 46 mm (noir)"),
  xiaomi("rw6", "Redmi Watch 6 (noir)", "2026-11-12"),
  xiaomi("sb10p", "Xiaomi Smart Band 10 Pro (noir)"),
  xiaomi("sb10", "Xiaomi Smart Band 10", "2026-11-12"),
];
