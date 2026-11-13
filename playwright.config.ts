import { defineConfig, devices } from "@playwright/test";

// Date du jour figée pour les tests (badge « Nouveau », §7.1 du plan).
process.env.VS_TODAY ??= "2026-11-12";

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    locale: "fr-FR",
    timezoneId: "Africa/Lome",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: { VS_TODAY: process.env.VS_TODAY },
  },
});
