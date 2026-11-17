import { describe, expect, it } from "vitest";
import { MIN_CACHE_SECONDS, secondsUntilLomeMidnight, todayCacheProfile } from "./lome-day";

describe("fin de journée à Lomé", () => {
  it("compte les secondes jusqu'à minuit UTC (Lomé = UTC+0)", () => {
    expect(secondsUntilLomeMidnight(new Date("2026-11-12T00:00:00Z"))).toBe(86_400);
    expect(secondsUntilLomeMidnight(new Date("2026-11-12T23:00:00Z"))).toBe(3_600);
  });

  it("fait expirer la date du jour à minuit, sans fenêtre périmée", () => {
    const profile = todayCacheProfile(new Date("2026-11-12T22:30:00Z"));
    expect(profile.revalidate).toBe(5_400);
    expect(profile.expire).toBe(profile.revalidate);
  });

  it("garde au moins 5 minutes pour que la page reste prérendue", () => {
    expect(todayCacheProfile(new Date("2026-11-12T23:59:30Z")).expire).toBe(MIN_CACHE_SECONDS);
  });
});
