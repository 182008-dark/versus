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

export type CatalogProduct = {
  id: string;
  code: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  brand_slug: Brand;
  brand_name: string;
  category_slug: CategorySlug;
  compare_group: CompareGroup;
  visual_kind: DeviceKind;
  release_date: string;
  new_until: string;
  warranty_months: number;
  compat: readonly ("ios" | "android")[];
  min_price_fcfa: number;
  in_stock: boolean;
  image_src: string;
  image_width: number;
  image_height: number;
  image_alt: string;
  variants: readonly ProductVariant[];
  specs: ProductSpecs;
};

export type CatalogCategory = {
  slug: CategorySlug;
  name: string;
  intro: string;
  compare_group: CompareGroup;
  position: number;
};

export type HomeSlot = {
  slot: "hero" | "tile" | "rail" | "compare";
  product_code: string;
  position: number;
  theme_key: Brand | "default";
  headline: string | null;
  subline: string | null;
};

export type HomeCatalog = {
  hero: CatalogProduct[];
  tiles: CatalogProduct[];
  rail: CatalogProduct[];
  compare: CatalogProduct[];
};

export type ProductCardData = CatalogProduct & {
  is_new: boolean;
};
