import { describe, expect, it } from "vitest";
import { formatSpec } from "./spec";

describe("formatSpec", () => {
  it("écrit la virgule décimale et colle les pouces au nombre", () => {
    expect(formatSpec(6.3, "″")).toBe("6,3″");
    expect(formatSpec(6.83, "″")).toBe("6,83″");
  });

  it("place une espace insécable avant les autres unités", () => {
    expect(formatSpec(6.9, "mm")).toBe("6,9 mm");
    expect(formatSpec(100, "W")).toBe("100 W");
  });

  it("sépare les milliers par une espace fine insécable", () => {
    expect(formatSpec(5000, "mAh")).toBe("5 000 mAh");
  });

  it("limite les décimales à la demande, sans zéro inutile", () => {
    expect(formatSpec(6.0, "″")).toBe("6″");
    expect(formatSpec(1.234, "kg", { maximumFractionDigits: 1 })).toBe("1,2 kg");
  });

  it("rend le nombre seul sans unité et refuse une valeur non finie", () => {
    expect(formatSpec(12, "")).toBe("12");
    expect(() => formatSpec(Number.NaN, "W")).toThrow(RangeError);
  });
});
