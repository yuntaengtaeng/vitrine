import esbuild from "esbuild";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(packageRoot, "dist");
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"));
const external = Object.keys(packageJson.peerDependencies ?? {});

fs.rmSync(distRoot, { recursive: true, force: true });

const shared = { bundle: true, platform: "node", format: "esm", target: "node18", external, logLevel: "info" };
await esbuild.build({
  ...shared,
  entryPoints: ["index", "cli"].map((name) => path.join(packageRoot, "src", `${name}.ts`)),
  outdir: distRoot,
});

const declarationRoot = fs.mkdtempSync(path.join(os.tmpdir(), "vitrine-static-declarations-"));
const tscPath = path.join(packageRoot, "node_modules", "typescript", "bin", "tsc");
try {
  execFileSync(process.execPath, [tscPath, "-p", "tsconfig.json", "--emitDeclarationOnly", "--outDir", declarationRoot], {
    cwd: packageRoot,
    stdio: "inherit",
  });
  fs.copyFileSync(path.join(declarationRoot, "index.d.ts"), path.join(distRoot, "index.d.ts"));
} finally {
  fs.rmSync(declarationRoot, { recursive: true, force: true });
}
