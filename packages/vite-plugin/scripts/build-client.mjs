import esbuild from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(packageRoot, "client", "gallery-client.tsx");
const outfile = path.join(packageRoot, "client", "gallery-client.js");

// bundle: true라서 ./styles, ./colors 같은 상대 import는 산출물 하나로 인라인됨
// (index.ts가 이 파일을 fs.readFileSync로 통째로 읽어 서빙하므로, 여러 파일로 쪼개도
// 서빙되는 건 여전히 단일 문자열이어야 함) — react/virtual:vitrine-previews처럼 브라우저에서
// Vite dev 서버가 서빙 시점에 해석해야 하는 것만 external로 남김
const options = {
  entryPoints: [entry],
  outfile,
  bundle: true,
  external: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "virtual:vitrine-previews"],
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
