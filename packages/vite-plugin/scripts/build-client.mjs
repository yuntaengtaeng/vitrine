import esbuild from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PREVIEWS_MODULE_ID } from "@vitrine/protocol";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(packageRoot, "client", "gallery-client.tsx");
const outfile = path.join(packageRoot, "dist", "gallery", "gallery-client.js");

// Gallery는 package files에 포함되는 dist 아래 단일 bundle로 생성
// React와 virtual module은 사용자의 Vite runtime이 해석하므로 external로 유지
const options = {
  entryPoints: [entry],
  outfile,
  bundle: true,
  external: [
    "react",
    "react-dom",
    "react-dom/client",
    "react/jsx-runtime",
    PREVIEWS_MODULE_ID,
    "@vitrine/vite-plugin/preview",
  ],
  jsx: "automatic",
  format: "esm",
  target: "es2022",
  logLevel: "info",
};

if (process.argv.includes("--watch")) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
} else {
  await esbuild.build(options);
}
