import "server-only";

import { cacheLife } from "next/cache";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Date calendaire actuelle au Togo (UTC+0), stable quel que soit le fuseau du serveur. */
export async function getToday(): Promise<string> {
  "use cache";
  cacheLife("hours");

  const override = process.env.VS_TODAY;
  if (process.env.VERCEL_ENV !== "production" && override) {
    const parsed = new Date(`${override}T00:00:00Z`);
    if (
      !DATE_PATTERN.test(override) ||
      Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== override
    ) {
      throw new Error("VS_TODAY doit être une date valide au format AAAA-MM-JJ.");
    }
    return override;
  }
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lome" }).format(new Date());
}
