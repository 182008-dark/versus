import { describe, expect, it } from "vitest";
import { products } from "@/data/catalog";
import {
  colorLabel,
  initialVariant,
  variantGroups,
  variantSearch,
  variantViews,
  type PickerVariant,
} from "./variant-options";
import { matchSearch } from "./variant-search";

function variantsOf(code: string): PickerVariant[] {
  const product = products.find((item) => item.code === code);
  if (!product) throw new Error(code);
  return product.variants.filter((variant) => variant.is_active);
}

const ip18 = variantsOf("ip18");
const gw9 = variantsOf("gw9");
const bySku = (variants: PickerVariant[], sku: string) => variants.find((v) => v.sku === sku)!;

describe("colorLabel", () => {
  it("retire la capacité et la taille du nom de coloris", () => {
    expect(colorLabel(bySku(ip18, "IP18-BOR-512"))).toBe("Bordeaux");
    expect(colorLabel(bySku(gw9, "GW9-44-GRA"))).toBe("Graphite");
  });
});

describe("initialVariant", () => {
  it("prend la variante par défaut si elle est en stock, sinon la première en stock", () => {
    // IP18-BOR-256 est la variante par défaut, mais épuisée.
    expect(bySku(ip18, "IP18-BOR-256")).toMatchObject({ is_default: true, stock: 0 });
    expect(initialVariant(ip18).sku).toBe("IP18-BOR-512");
    expect(initialVariant(gw9).sku).toBe("GW9-40-GRA");
  });

  it("garde la variante par défaut quand tout est épuisé", () => {
    const soldOut = ip18.map((variant) => ({ ...variant, stock: 0 }));
    expect(initialVariant(soldOut).sku).toBe("IP18-BOR-256");
  });
});

describe("variantGroups", () => {
  it("propose chaque coloris, et les capacités du coloris choisi", () => {
    const groups = variantGroups(ip18, bySku(ip18, "IP18-BOR-512"));
    expect(groups.map((group) => group.key)).toEqual(["color", "storage"]);
    const [colors, storages] = groups;
    expect(colors?.options.map((o) => [o.label, o.selected])).toEqual([
      ["Bordeaux", true],
      ["Argent", false],
      ["Glacier", false],
      ["Noir", false],
    ]);
    expect(storages?.options.map((o) => [o.label, o.sku, o.unavailable, o.note])).toEqual([
      ["256 Go", "IP18-BOR-256", true, null],
      ["512 Go", "IP18-BOR-512", false, null],
    ]);
    expect(colors?.selectedLabel).toBe("Bordeaux");
    expect(storages?.selectedLabel).toBe("512 Go");
  });

  it("changer de coloris garde la capacité si elle existe, sinon la première disponible", () => {
    const [colors] = variantGroups(ip18, bySku(ip18, "IP18-BOR-512"));
    // L'argent n'existe qu'en 256 Go.
    expect(colors?.options.find((o) => o.label === "Argent")?.sku).toBe("IP18-ARG-256");
    const [fromSilver] = variantGroups(ip18, bySku(ip18, "IP18-ARG-256"));
    // Retour au bordeaux en 256 Go (épuisé) : la même capacité est gardée ; le coloris n'est pas
    // indisponible pour autant (512 Go en stock), la pastille dit ce qui reste.
    expect(fromSilver?.options.find((o) => o.label === "Bordeaux")).toMatchObject({
      sku: "IP18-BOR-256",
      unavailable: false,
      note: "512 Go seulement",
    });
    expect(fromSilver?.options.find((o) => o.label === "Noir")).toMatchObject({
      unavailable: false,
      note: null,
    });
  });

  it("marque un coloris indisponible seulement quand toutes ses variantes sont épuisées", () => {
    const noBordeaux = ip18.map((variant) =>
      variant.color_slug === "bordeaux" ? { ...variant, stock: 0 } : variant,
    );
    const [colors] = variantGroups(noBordeaux, bySku(noBordeaux, "IP18-ARG-256"));
    expect(colors?.options.find((o) => o.label === "Bordeaux")).toMatchObject({
      unavailable: true,
      note: null,
    });
  });

  it("propose les tailles d'une montre", () => {
    const groups = variantGroups(gw9, bySku(gw9, "GW9-40-GRA"));
    expect(groups.map((group) => group.key)).toEqual(["color", "size"]);
    expect(groups[1]?.options.map((o) => o.label)).toEqual(["40 mm", "44 mm"]);
  });
});

describe("adresse de la variante (?couleur=&stockage=&taille=)", () => {
  const ip18Views = variantViews("iPhone 18 Pro", ip18);
  const gw9Views = variantViews("Galaxy Watch9", gw9);

  it("écrit et relit la sélection", () => {
    const variant = bySku(ip18, "IP18-BOR-512");
    expect(variantSearch(variant)).toBe("?couleur=bordeaux&stockage=512");
    expect(matchSearch(ip18Views, "?couleur=bordeaux&stockage=512")?.sku).toBe("IP18-BOR-512");
    expect(variantSearch(bySku(gw9, "GW9-44-GRA"))).toBe("?couleur=graphite&taille=44");
    expect(matchSearch(gw9Views, "?taille=44")?.sku).toBe("GW9-44-GRA");
  });

  it("ignore une adresse sans sélection ou qui ne correspond à rien", () => {
    expect(matchSearch(ip18Views, "")).toBeUndefined();
    expect(matchSearch(ip18Views, "?couleur=rose")).toBeUndefined();
    expect(matchSearch(ip18Views, "?stockage=abc")).toBeUndefined();
    expect(matchSearch(ip18Views, "?utm=x")).toBeUndefined();
  });
});

describe("variantViews", () => {
  it("prépare, pour chaque variante, son adresse, son nom, son prix, son stock et ses groupes", () => {
    const views = variantViews("iPhone 18 Pro", ip18);
    expect(views).toHaveLength(ip18.length);
    const bordeaux = views.find((view) => view.sku === "IP18-BOR-512")!;
    expect(bordeaux).toMatchObject({
      search: "?couleur=bordeaux&stockage=512",
      name: "iPhone 18 Pro (Bordeaux · 512 Go)",
      price_fcfa: bySku(ip18, "IP18-BOR-512").price_fcfa,
      status: "Bordeaux : en stock.",
    });
    expect(bordeaux.groups.map((group) => group.legend)).toEqual(["Coloris", "Capacité"]);
    expect(bordeaux.groups).toEqual(variantGroups(ip18, bySku(ip18, "IP18-BOR-512")));
  });

  it("explique une combinaison épuisée", () => {
    const views = variantViews("iPhone 18 Pro", ip18);
    expect(views.find((view) => view.sku === "IP18-BOR-256")?.status).toMatch(
      /^Cette version est épuisée/,
    );
  });
});
