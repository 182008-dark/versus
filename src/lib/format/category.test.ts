import { describe, expect, it } from "vitest";
import { categories } from "@/data/catalog";
import { CATEGORIES } from "@/lib/catalog/types";
import { categoryLabel } from "./category";

describe("categoryLabel", () => {
  it("rend un libellé accentué, jamais le slug", () => {
    expect(categoryLabel("ecouteurs")).toBe("Écouteurs");
    for (const slug of CATEGORIES) {
      expect(categoryLabel(slug)).not.toBe(slug);
    }
  });

  it("reprend le nom de chaque catégorie du catalogue", () => {
    for (const category of categories) {
      expect(categoryLabel(category.slug)).toBe(category.name);
    }
  });
});
