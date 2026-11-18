import { describe, expect, it } from "vitest";
import { brands, categories, homeSlots, products } from "@/data/catalog";
import type { Brand } from "@/lib/brand-themes";
import {
  brandRangeLabel,
  brandShowcase,
  colorSwatches,
  compareShortcuts,
  featuredProducts,
  findBrand,
  groupByCategory,
  otherBrands,
  priceSpan,
  productsOfBrand,
} from "./brand-page";
import type { CatalogCategory } from "./types";

const NBSP = /[  ]/g;
const plain = (text: string) => text.replace(NBSP, " ");

const compareEntries = homeSlots
  .filter((slot) => slot.slot === "compare")
  .toSorted((a, b) => a.position - b.position)
  .map((slot) => products.find((product) => product.code === slot.product_code)!);

describe("findBrand", () => {
  it("trouve une marque connue par son slug", () => {
    expect(findBrand(brands, "samsung")?.name).toBe("Samsung");
  });

  it("renvoie undefined pour une marque inconnue (page introuvable)", () => {
    expect(findBrand(brands, "inconnue")).toBeUndefined();
    expect(findBrand(brands, "Samsung")).toBeUndefined();
    expect(findBrand(brands, "")).toBeUndefined();
  });
});

describe("productsOfBrand", () => {
  for (const brand of ["apple", "samsung", "xiaomi"] as const satisfies Brand[]) {
    it(`ne garde que les ${brand}, du plus cher au moins cher`, () => {
      const selected = productsOfBrand(products, brand);
      expect(selected).toHaveLength(
        products.filter((product) => product.brand_slug === brand).length,
      );
      expect(selected).toHaveLength(10);
      expect(selected.every((product) => product.brand_slug === brand)).toBe(true);
      const prices = selected.map((product) => product.min_price_fcfa ?? 0);
      expect(prices).toEqual(prices.toSorted((a, b) => b - a));
    });
  }

  it("place en dernier un produit sans prix (aucune variante active)", () => {
    const [first, second] = products.filter((product) => product.brand_slug === "apple");
    const selected = productsOfBrand([{ ...first!, min_price_fcfa: null }, second!], "apple");
    expect(selected.map((product) => product.code)).toEqual([second!.code, first!.code]);
  });

  it("ne modifie pas la liste reçue", () => {
    const copy = [...products];
    productsOfBrand(products, "xiaomi");
    expect(products).toEqual(copy);
  });
});

describe("groupByCategory", () => {
  const counts = (brand: Brand) =>
    groupByCategory(productsOfBrand(products, brand), categories).map(
      (group) => [group.category.slug, group.products.length] as const,
    );

  it("regroupe par catégorie, dans l'ordre des catégories", () => {
    expect(counts("samsung")).toEqual([
      ["smartphones", 5],
      ["ecouteurs", 2],
      ["montres", 2],
      ["bracelets", 1],
    ]);
    expect(counts("xiaomi")).toEqual([
      ["smartphones", 4],
      ["ecouteurs", 2],
      ["montres", 2],
      ["bracelets", 2],
    ]);
  });

  it("masque une catégorie vide : Apple n'a pas de bracelets", () => {
    expect(counts("apple")).toEqual([
      ["smartphones", 4],
      ["ecouteurs", 3],
      ["montres", 3],
    ]);
  });

  it("suit la position des catégories, pas l'ordre du tableau reçu", () => {
    const reversed: CatalogCategory[] = categories.toReversed();
    const groups = groupByCategory(productsOfBrand(products, "samsung"), reversed);
    expect(groups.map((group) => group.category.slug)).toEqual([
      "smartphones",
      "ecouteurs",
      "montres",
      "bracelets",
    ]);
  });

  it("garde l'ordre des produits dans chaque section (haut de gamme d'abord)", () => {
    const [phones] = groupByCategory(productsOfBrand(products, "samsung"), categories);
    expect(phones?.products.map((product) => product.name)).toEqual([
      "Galaxy Z Fold8",
      "Galaxy S26 Ultra",
      "Galaxy Z Flip8",
      "Galaxy S26",
      "Galaxy A57 5G",
    ]);
  });

  it("ne renvoie aucune section sans produit", () => {
    expect(groupByCategory([], categories)).toEqual([]);
  });
});

describe("priceSpan et brandRangeLabel", () => {
  it("calcule la fourchette des prix d'entrée d'une marque", () => {
    const samsung = productsOfBrand(products, "samsung");
    const min = Math.min(...samsung.map((product) => product.min_price_fcfa!));
    const max = Math.max(...samsung.map((product) => product.min_price_fcfa!));
    expect(priceSpan(samsung)).toEqual({ min, max });
  });

  it("ignore les produits sans prix, et renvoie null s'il n'en reste aucun", () => {
    const [first] = productsOfBrand(products, "apple");
    expect(priceSpan([{ ...first!, min_price_fcfa: null }])).toBeNull();
    expect(priceSpan([])).toBeNull();
  });

  it("compose « 10 produits · de … à … FCFA » à partir des données", () => {
    expect(plain(brandRangeLabel(10, { min: 46_000, max: 1_311_000 }))).toBe(
      "10 produits · de 46 000 à 1 311 000 FCFA",
    );
    expect(plain(brandRangeLabel(1, { min: 98_000, max: 98_000 }))).toBe("1 produit · 98 000 FCFA");
    expect(brandRangeLabel(0, null)).toBe("0 produit");
  });
});

describe("featuredProducts", () => {
  it("prend le produit phare des trois premières catégories", () => {
    const groups = groupByCategory(productsOfBrand(products, "samsung"), categories);
    expect(featuredProducts(groups).map((product) => product.name)).toEqual([
      "Galaxy Z Fold8",
      "Galaxy Buds4 Pro",
      "Galaxy Watch Ultra2",
    ]);
  });

  it("complète avec les produits suivants quand il y a moins de trois catégories", () => {
    const phones = productsOfBrand(products, "apple").filter(
      (product) => product.category_slug === "smartphones",
    );
    const groups = groupByCategory(phones, categories);
    expect(featuredProducts(groups).map((product) => product.code)).toEqual([
      "ipd",
      "ip18",
      "ip17",
    ]);
  });
});

describe("otherBrands", () => {
  it("renvoie les deux autres marques, dans l'ordre des marques", () => {
    expect(otherBrands(brands, "samsung").map((brand) => brand.slug)).toEqual(["apple", "xiaomi"]);
    expect(otherBrands(brands, "apple").map((brand) => brand.slug)).toEqual(["samsung", "xiaomi"]);
  });
});

describe("compareShortcuts", () => {
  it("oppose le produit comparé de la marque à celui de chacune des deux autres", () => {
    const shortcuts = compareShortcuts(compareEntries, "samsung", ["apple", "xiaomi"]);
    expect(shortcuts).toHaveLength(2);
    for (const { mine, theirs } of shortcuts) {
      expect(mine.brand_slug).toBe("samsung");
      expect(mine.compare_group).toBe(theirs.compare_group);
    }
    expect(shortcuts.map(({ theirs }) => theirs.brand_slug)).toEqual(["apple", "xiaomi"]);
  });

  it("choisit la première famille où les deux marques sont présentes", () => {
    const [first] = compareShortcuts(compareEntries, "apple", ["samsung"]);
    const firstGroup = compareEntries[0]!.compare_group;
    expect(first?.mine.compare_group).toBe(firstGroup);
  });

  it("passe une marque absente du comparateur", () => {
    const appleOnly = compareEntries.filter((product) => product.brand_slug === "apple");
    expect(compareShortcuts(appleOnly, "apple", ["samsung", "xiaomi"])).toEqual([]);
  });
});

describe("colorSwatches", () => {
  it("donne un coloris par color_slug, sans capacité ni taille, dans l'ordre des variantes", () => {
    for (const product of products) {
      const swatches = colorSwatches(product.variants);
      const slugs = new Set(product.variants.filter((v) => v.is_active).map((v) => v.color_slug));
      expect(swatches.map((swatch) => swatch.slug)).toEqual([...slugs]);
      for (const swatch of swatches) {
        expect(swatch.name, product.code).not.toMatch(/\d+ (Go|To|mm)/);
        expect(swatch.name.length, product.code).toBeGreaterThan(0);
      }
    }
  });

  it("retire la capacité (« Noir · 256 Go ») et la taille (« 46 mm · Argent »)", () => {
    const base = { is_active: true, color_hex: null };
    expect(
      colorSwatches([
        {
          ...base,
          color_slug: "noir",
          color_name: "Noir · 256 Go",
          storage_gb: 256,
          size_mm: null,
          position: 1,
        },
        {
          ...base,
          color_slug: "noir",
          color_name: "Noir · 512 Go",
          storage_gb: 512,
          size_mm: null,
          position: 2,
        },
        {
          ...base,
          color_slug: "argent",
          color_name: "46 mm · Argent",
          storage_gb: null,
          size_mm: 46,
          position: 0,
        },
      ]).map((swatch) => swatch.name),
    ).toEqual(["Argent", "Noir"]);
  });

  it("ignore les variantes inactives", () => {
    const variant = { color_hex: null, storage_gb: null, size_mm: null };
    expect(
      colorSwatches([
        { ...variant, color_slug: "a", color_name: "A", is_active: false, position: 0 },
        { ...variant, color_slug: "b", color_name: "B", is_active: true, position: 1 },
      ]).map((swatch) => swatch.slug),
    ).toEqual(["b"]);
  });
});

describe("brandShowcase", () => {
  const featured = new Set(
    homeSlots
      .filter((slot) => slot.slot === "hero" || slot.slot === "tile")
      .map((slot) => slot.product_code),
  );
  const codes = (brand: Brand) =>
    brandShowcase(products, categories, brand, featured).map((product) => product.code);

  it("prend le haut de gamme de chaque catégorie, hors hero et tuiles", () => {
    expect(codes("apple")).toEqual(["ipd", "apm2", "awu4"]);
    expect(codes("samsung")).toEqual(["zf8", "gb4p", "gwu2"]);
    expect(codes("xiaomi")).toEqual(["x17", "xb6", "xws5"]);
  });

  it("ne montre que des produits de la marque, jamais un produit exclu", () => {
    for (const brand of ["apple", "samsung", "xiaomi"] as const) {
      for (const product of brandShowcase(products, categories, brand, featured)) {
        expect(product.brand_slug).toBe(brand);
        expect(featured.has(product.code)).toBe(false);
      }
    }
  });

  it("s'arrête au nombre demandé", () => {
    expect(brandShowcase(products, categories, "samsung", new Set(), 2)).toHaveLength(2);
  });
});
