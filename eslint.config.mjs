import base from "@vitrine/eslint-config/base";
import node from "@vitrine/eslint-config/node";
import react from "@vitrine/eslint-config/react";
import { defineConfig } from "eslint/config";
import fs from "node:fs";

const GALLERY_ROOT = "packages/vite-plugin/client/gallery";
const galleryDir = (path) =>
  fs.readdirSync(new URL(`./${GALLERY_ROOT}/${path}`, import.meta.url), { withFileTypes: true });
const GALLERY_FEATURES = galleryDir("features")
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
const GALLERY_COMPOSITION = galleryDir("")
  .filter((entry) => entry.isFile() && /^[^.]+\.tsx?$/.test(entry.name))
  .map((entry) => entry.name.replace(/\.tsx?$/, ""));

const NO_FRAME_IMPORT = {
  regex: String.raw`^(\.\./)+frame/`,
  message: "Gallery는 frame 코드 대신 @vitrine/protocol 타입만 사용합니다.",
};
const NO_COMPOSITION_IMPORT = {
  regex: String.raw`^(\.\./)+(${GALLERY_COMPOSITION.join("|")})$`,
  message: "기능은 조합 module을 import하지 않습니다.",
};

const galleryBoundaries = [
  ...GALLERY_FEATURES.map((feature) => ({
    name: `vitrine/gallery-feature-${feature}`,
    files: [`${GALLERY_ROOT}/features/${feature}/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            NO_FRAME_IMPORT,
            NO_COMPOSITION_IMPORT,
            ...GALLERY_FEATURES.filter((other) => other !== feature).map((other) => ({
              regex: String.raw`^(\.\./)+${other}(/|$)`,
              message: `feature끼리는 import하지 않습니다. 함께 쓰는 코드는 gallery/shared로 옮깁니다.`,
            })),
          ],
        },
      ],
    },
  })),
  {
    name: "vitrine/gallery-shared",
    files: [`${GALLERY_ROOT}/shared/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            NO_FRAME_IMPORT,
            NO_COMPOSITION_IMPORT,
            { regex: String.raw`^(\.\./)+features/`, message: "shared는 feature를 import하지 않습니다." },
          ],
        },
      ],
    },
  },
  {
    name: "vitrine/gallery-root",
    files: [`${GALLERY_ROOT}/*.{ts,tsx}`],
    rules: { "no-restricted-imports": ["error", { patterns: [NO_FRAME_IMPORT] }] },
  },
  {
    name: "vitrine/frame",
    files: ["packages/vite-plugin/client/frame/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: String.raw`(\.css$|^@vanilla-extract/)`,
              message: "frame은 사용자 문서라 stylesheet를 넣지 않고 inline style만 사용합니다.",
            },
            {
              regex: String.raw`^(\.\./)+gallery/`,
              message: "frame은 Gallery 코드를 import하지 않습니다.",
            },
          ],
        },
      ],
    },
  },
];

export default defineConfig(
  {
    name: "vitrine/ignores",
    ignores: [
      "**/dist/**",
      "**/vitrine-static/**",
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
      "tests/e2e/**/*.{js,cjs,mjs,ts,cts,mts}",
      "tests/*.{js,cjs,mjs,ts,cts,mts}",
      "apps/vscode-extension/**/*.{js,cjs,mjs,ts,cts,mts}",
      "packages/{protocol,vite-plugin,plugin-static}/src/**/*.{js,cjs,mjs,ts,cts,mts}",
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
  ...galleryBoundaries,
);
