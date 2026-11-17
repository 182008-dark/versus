import { describe, expect, it } from "vitest";
import { isNew } from "./is-new";

describe("isNew", () => {
  const product = { new_until: "2026-12-09" };

  it("inclut le dernier jour de nouveauté et retire le badge le lendemain", () => {
    expect(isNew(product, "2026-12-09")).toBe(true);
    expect(isNew(product, "2026-12-10")).toBe(false);
  });

  it("rejette une date de référence mal formée", () => {
    expect(isNew(product, "12/09/2026")).toBe(false);
  });

  it("ne signale rien sans date de fin de nouveauté", () => {
    expect(isNew({ new_until: null }, "2026-11-12")).toBe(false);
  });
});
