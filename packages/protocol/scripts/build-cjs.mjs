import esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

await esbuild.build({
  entryPoints: [path.join(packageRoot, "src", "index.ts")],
  outfile: path.join(packageRoot, "dist", "index.cjs"),
  bundle: true,
  format: "cjs",
  platform: "neutral",
  target: "es2022",
  logLevel: "info",
});

fs.copyFileSync(
  path.join(packageRoot, "dist", "index.d.ts"),
  path.join(packageRoot, "dist", "index.d.cts"),
);
