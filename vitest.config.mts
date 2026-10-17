import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Gallery 컴포넌트 테스트가 .css.ts 스타일을 import
  plugins: [vanillaExtractPlugin()],
  test: {
    include: [
      "apps/*/src/**/*.test.ts",
      "packages/*/src/**/*.test.ts",
      "packages/*/client/**/*.test.ts",
    ],
  },
});
