import esbuild from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(packageRoot, "client", "gallery-client.ts");
const outfile = path.join(packageRoot, "client", "gallery-client.js");

// bundle: false, TS 문법만 벗겨내는 단일 파일 트랜스파일, import 해석은 안 함
// (react, virtual:vitrine-previews 등은 브라우저에서 Vite dev 서버가 서빙 시점에 처리)
const options = {
  entryPoints: [entry],
  outfile,
  bundle: false,
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
