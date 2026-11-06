import { defineConfig, devices } from "@playwright/test";

// 다른 개발 서버와 겹치지 않는 고정 포트
const PORT = 5179;
const STATIC_PORT = 5199;

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
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] }, testIgnore: /setup-hot\.spec\.ts/ },
    // 모든 프리뷰가 쓰는 setup file을 고치는 test는 다른 test가 끝난 뒤 따로 실행
    {
      name: "setup-hot",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /setup-hot\.spec\.ts/,
      dependencies: ["chromium"],
    },
  ],
  webServer: [
    {
      command: `pnpm --filter @vitrine/example-react-basic exec vite --port ${PORT} --strictPort`,
      url: `http://localhost:${PORT}/__vitrine`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: `pnpm --filter @vitrine/example-showcase build:gallery && node tests/static-server.mjs examples/showcase/vitrine-static ${STATIC_PORT}`,
      url: `http://localhost:${STATIC_PORT}/gallery/`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
