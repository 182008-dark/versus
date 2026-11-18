import { describe, expect, it } from "vitest";
import { seeLabel } from "./see-label";

describe("seeLabel", () => {
  it("élide l'article devant une voyelle ou un h muet", () => {
    expect(seeLabel("iPhone 18 Pro")).toBe("Voir l'iPhone 18 Pro");
    expect(seeLabel("AirPods Pro 3")).toBe("Voir l'AirPods Pro 3");
  });

  it("garde « le » devant une consonne", () => {
    expect(seeLabel("Galaxy S26 Ultra")).toBe("Voir le Galaxy S26 Ultra");
    expect(seeLabel("Xiaomi 17 Ultra")).toBe("Voir le Xiaomi 17 Ultra");
    expect(seeLabel("Redmi Watch 6")).toBe("Voir le Redmi Watch 6");
  });
});
