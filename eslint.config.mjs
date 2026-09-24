import base from "@vitrine/eslint-config/base";
import node from "@vitrine/eslint-config/node";
import react from "@vitrine/eslint-config/react";
import { defineConfig } from "eslint/config";

export default defineConfig(
  {
    name: "vitrine/ignores",
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.vitrine/**",
      "**/.react-router/**",
      "apps/website/build/**",
      ".claude/**",
      ".codex/**",
      "coverage/**",
      "docs/preview-comment-patterns/**",
    ],
  },
  ...base,
  {
    name: "vitrine/node",
    files: [
      "*.config.{js,cjs,mjs,ts,cts,mts}",
      "scripts/**/*.{js,cjs,mjs,ts,cts,mts}",
      "apps/vscode-extension/**/*.{js,cjs,mjs,ts,cts,mts}",
      "packages/{protocol,vite-plugin}/src/**/*.{js,cjs,mjs,ts,cts,mts}",
      "packages/*/scripts/**/*.{js,cjs,mjs,ts,cts,mts}",
      "**/vite.config.{js,cjs,mjs,ts,cts,mts}",
    ],
    extends: node,
  },
  {
    name: "vitrine/react",
    files: [
      "packages/vite-plugin/client/**/*.{js,jsx,ts,tsx}",
      "examples/**/*.{js,jsx,ts,tsx}",
      "fixtures/**/*.{js,jsx,ts,tsx}",
      "apps/website/app/**/*.{js,jsx,ts,tsx}",
    ],
    extends: react,
  },
);
