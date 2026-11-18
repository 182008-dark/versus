import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CATEGORIES } from "@/lib/catalog/types";
import { brands, categories, homeSlots, products } from "./catalog";
import { productVisualSources } from "./product-visuals";

/** Largeur et hauteur lues dans l'en-tête IHDR d'un PNG (octets 16 à 23). */
function pngSize(file: string) {
  const header = readFileSync(file).subarray(0, 24);
  expect(header.subarray(1, 4).toString("latin1"), `${file} n'est pas un PNG`).toBe("PNG");
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

const addDays = (date: string, days: number) => {
  const day = new Date(`${date}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() + days);
  return day.toISOString().slice(0, 10);
};

const unique = (values: readonly string[]) => new Set(values).size === values.length;
const MAX_IMAGE_BYTES = 200 * 1000;

describe("catalogue de démonstration", () => {
  it("compte 30 produits, 10 par marque, dans des marques et catégories connues", () => {
    expect(products).toHaveLength(30);
    for (const brand of brands) {
      expect(
        products.filter((product) => product.brand_slug === brand.slug),
        brand.name,
      ).toHaveLength(10);
    }
    for (const product of products) {
      expect(CATEGORIES).toContain(product.category_slug);
      const category = categories.find((item) => item.slug === product.category_slug);
      expect(product.compare_group, product.code).toBe(category?.compare_group);
      expect(product.brand_name, product.code).toBe(
        brands.find((brand) => brand.slug === product.brand_slug)?.name,
      );
    }
  });

  it("a des identifiants, codes, slugs et SKU uniques", () => {
    expect(unique(products.map((product) => product.id))).toBe(true);
    expect(unique(products.map((product) => product.code))).toBe(true);
    expect(unique(products.map((product) => product.slug))).toBe(true);
    expect(unique(products.flatMap((product) => product.variants.map((v) => v.sku)))).toBe(true);
    for (const product of products) {
      expect(product.code).toMatch(/^[a-z0-9]+$/);
      expect(product.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("donne à chaque produit une image existante, légère, aux dimensions réelles", () => {
    for (const product of products) {
      expect(product.image_src, product.code).toBe(`/products/${product.code}.png`);
      const file = join(process.cwd(), "public", product.image_src ?? "");
      expect(existsSync(file), file).toBe(true);
      expect(statSync(file).size, `${file} dépasse 200 Ko`).toBeLessThan(MAX_IMAGE_BYTES);
      expect(pngSize(file), product.code).toEqual({
        width: product.image_width,
        height: product.image_height,
      });
      expect(Math.max(product.image_width ?? 0, product.image_height ?? 0)).toBeLessThanOrEqual(
        900,
      );
      expect(product.image_alt?.length, product.code).toBeGreaterThan(0);
    }
  });

  it("crédite chaque visuel dans SOURCES.md et sur la page /credits", () => {
    const sources = readFileSync(join(process.cwd(), "public/products/SOURCES.md"), "utf8");
    expect(productVisualSources.map((visual) => visual.code).toSorted()).toEqual(
      products.map((product) => product.code).toSorted(),
    );
    for (const product of products) {
      expect(sources, product.code).toContain(`| ${product.code}.png |`);
      expect(productVisualSources.find((visual) => visual.code === product.code)?.brand).toBe(
        product.brand_slug,
      );
    }
  });

  it("a des variantes cohérentes et un prix minimal égal à la variante active la moins chère", () => {
    for (const product of products) {
      const { variants } = product;
      expect(variants.length, product.code).toBeGreaterThan(0);
      expect(
        variants.filter((variant) => variant.is_default),
        product.code,
      ).toHaveLength(1);
      expect(variants.find((variant) => variant.is_default)?.position).toBe(0);
      expect(variants.map((variant) => variant.position)).toEqual(variants.map((_, i) => i));
      for (const variant of variants) {
        expect(Number.isInteger(variant.price_fcfa), variant.sku).toBe(true);
        expect(variant.price_fcfa, variant.sku).toBeGreaterThan(0);
        expect(variant.price_fcfa % 1000, `${variant.sku} : arrondi au millier`).toBe(0);
        expect(variant.color_hex ?? "#000000", variant.sku).toMatch(/^#[0-9A-F]{6}$/);
        expect(variant.sku.startsWith(`${product.code.toUpperCase()}-`), variant.sku).toBe(true);
        expect(variant.stock).toBeGreaterThanOrEqual(0);
      }
      // Toutes les variantes d'un produit décrivent les mêmes axes (capacité, taille).
      const hasStorage = variants.map((variant) => variant.storage_gb !== null);
      const hasSize = variants.map((variant) => variant.size_mm !== null);
      expect(new Set(hasStorage).size, product.code).toBe(1);
      expect(new Set(hasSize).size, product.code).toBe(1);
      expect(
        unique(variants.map((v) => `${v.color_slug}|${v.storage_gb}|${v.size_mm}`)),
        product.code,
      ).toBe(true);
      if (product.category_slug !== "smartphones") expect(hasStorage[0]).toBe(false);
      const activePrices = variants.filter((v) => v.is_active).map((v) => v.price_fcfa);
      expect(product.min_price_fcfa).toBe(Math.min(...activePrices));
      expect(product.max_price_fcfa).toBe(Math.max(...activePrices));
      expect(product.in_stock).toBe(variants.some((v) => v.is_active && v.stock > 0));
    }
  });

  it("signale un produit comme nouveau pendant 90 jours après sa sortie", () => {
    for (const product of products) {
      expect(product.release_date, product.code).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(product.new_until, product.code).toBe(addDays(product.release_date, 90));
    }
  });

  it("définit les sélections de l'accueil (refonte, §3.1 et §5) et un ordre unique par emplacement", () => {
    const codes = (kind: string) =>
      homeSlots.filter((slot) => slot.slot === kind).map((slot) => slot.product_code);
    expect(codes("hero")).toEqual(["ip18", "s26u", "x17u"]);
    expect(codes("tile")).toEqual(["a57", "app3", "rw6"]);
    // Comparateur : trois familles de trois produits, une marque par colonne.
    expect(codes("compare")).toEqual([
      ...["ip18", "s26u", "x17u"],
      ...["app3", "gb4p", "xb6"],
      ...["aw12", "gw9", "xws5"],
    ]);
    // Nouveautés : les 10 sorties les plus récentes, de la plus récente à la plus ancienne.
    const latest = products
      .toSorted((a, b) => b.release_date.localeCompare(a.release_date))
      .slice(0, 10)
      .map((product) => product.code);
    expect(codes("rail").toSorted()).toEqual(latest.toSorted());
    const railDates = codes("rail").map(
      (code) => products.find((product) => product.code === code)!.release_date,
    );
    expect(railDates).toEqual(railDates.toSorted().reverse());
    expect(new Set(homeSlots.map((slot) => `${slot.slot}:${slot.position}`)).size).toBe(
      homeSlots.length,
    );
    const known = new Set(products.map((product) => product.code));
    for (const slot of homeSlots)
      expect(known.has(slot.product_code), slot.product_code).toBe(true);
  });
});
