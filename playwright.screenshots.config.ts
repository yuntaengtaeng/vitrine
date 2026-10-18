import { defineConfig, devices } from "@playwright/test";

const PORT = 5189;

export default defineConfig({
  testDir: "scripts/screenshots",
  testMatch: "*.shots.ts",
  workers: 1,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  },
  webServer: {
    command: `pnpm --filter @vitrine/example-showcase exec vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/__vitrine`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
