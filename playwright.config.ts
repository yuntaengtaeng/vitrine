import { defineConfig, devices } from "@playwright/test";

// 다른 개발 서버와 겹치지 않는 고정 포트
const PORT = 5179;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm --filter @vitrine/example-react-basic exec vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/__vitrine`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
