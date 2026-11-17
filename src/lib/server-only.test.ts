import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/** Modules de `src/lib` qui mettent en cache côté serveur (`"use cache"`, `next/cache`). */
function serverCacheModules(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return serverCacheModules(path);
    if (!/\.tsx?$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) return [];
    const source = readFileSync(path, "utf8");
    return /"use cache"|from "next\/cache"/.test(source)
      ? [relative(process.cwd(), path).replaceAll("\\", "/")]
      : [];
  });
}

describe("convention server-only (AGENTS.md)", () => {
  const modules = serverCacheModules(join(process.cwd(), "src", "lib"));

  it("trouve au moins un module serveur à vérifier", () => {
    expect(modules.length).toBeGreaterThan(0);
  });

  it.each(modules)('%s commence par import "server-only"', (path) => {
    const firstLine = readFileSync(path, "utf8").split(/\r?\n/, 1)[0];
    expect(firstLine).toBe('import "server-only";');
  });
});
