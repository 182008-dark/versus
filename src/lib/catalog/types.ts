import type { Brand, DeviceKind } from "@/lib/brand-themes";

export const CATEGORIES = ["smartphones", "ecouteurs", "montres", "bracelets"] as const;
export type CategorySlug = (typeof CATEGORIES)[number];
export type CompareGroup = "phones" | "audio" | "wearables";

export type ProductVariant = {
  sku: string;
  color_name: string;
  color_slug: string;
  color_hex: string | null;
  storage_gb: number | null;
  size_mm: number | null;
  price_fcfa: number;
  stock: number;
  low_stock_threshold: number;
  is_default: boolean;
  is_active: boolean;
  position: number;
};

export type ProductSpecs = {
  screen_size_in?: number;
  screen_tech?: string;
  refresh_hz?: number;
  chip?: string;
  battery_mah?: number;
  autonomy_hours?: number;
  charging_w?: number;
  main_camera_mp?: number;
  weight_g?: number;
  ip_rating?: string;
  has_5g?: boolean;
  has_anc?: boolean;
  specs_note: string;
};

export type Compat = "ios" | "android";

/**
 * Une ligne de la future vue `catalog_products` (§5.4), colonne pour colonne. Les colonnes
 * issues d'un LEFT JOIN (image principale) ou d'un agrégat filtré (prix minimal) peuvent valoir
 * `null` : le compilateur oblige à traiter ce cas dès l'étape 3, avant le passage à Supabase.
 */
export type CatalogProductRow = {
  id: string;
  code: string;
  slug: string;
  name: string;
  tagline: string;
  brand_slug: Brand;
  brand_name: string;
  category_slug: CategorySlug;
  compare_group: CompareGroup;
  visual_kind: DeviceKind;
  release_date: string;
  /** Colonne `date` nullable (le trigger `products_defaults` la renseigne). */
  new_until: string | null;
  warranty_months: number;
  compat: readonly Compat[];
  /** `min(price_fcfa) filter (where is_active)` : null sans variante active. */
  min_price_fcfa: number | null;
  /**
   * `max(price_fcfa) filter (where is_active)` : null sans variante active. Égal à
   * `min_price_fcfa` quand toutes les variantes ont le même prix, ce qui retire « Dès » (§4.7).
   */
  max_price_fcfa: number | null;
  in_stock: boolean;
  /** Image principale (LEFT JOIN `product_images … and is_primary`). */
  image_src: string | null;
  image_width: number | null;
  image_height: number | null;
  image_alt: string | null;
};

/** Fiche complète : la ligne de la vue, plus la description, les variantes et les specs. */
export type ProductDetail = CatalogProductRow & {
  description: string;
  variants: readonly ProductVariant[];
  specs: ProductSpecs;
};

export type CatalogBrand = {
  slug: Brand;
  name: string;
  tagline: string;
  position: number;
};

export type CatalogCategory = {
  slug: CategorySlug;
  name: string;
  intro: string;
  compare_group: CompareGroup;
  position: number;
};

export type HomeSlotKind = "hero" | "tile" | "rail" | "compare";

export type HomeSlot = {
  slot: HomeSlotKind;
  product_code: string;
  position: number;
  /** Clé d'un thème de `lib/brand-themes.ts` (`default` : thème de la marque du produit). */
  theme_key: string;
  headline: string | null;
  subline: string | null;
};

/** Un emplacement de l'accueil résolu avec son produit. */
export type HomeEntry = Omit<HomeSlot, "product_code" | "slot"> & { product: ProductDetail };

export type HomeCatalog = Record<HomeSlotKind, HomeEntry[]>;
