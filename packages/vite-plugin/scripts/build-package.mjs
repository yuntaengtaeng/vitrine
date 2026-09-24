import esbuild from "esbuild";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(packageRoot, "dist");
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"));

// 공개 subpath entry, 나머지 module은 번들 내부로만 존재
const PUBLIC_ENTRIES = ["index", "preview"];

// 배포 dependency에 없는 workspace package(@vitrine/protocol)는 번들에 포함
const external = [
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.peerDependencies ?? {}),
];

fs.rmSync(distRoot, { recursive: true, force: true });

await esbuild.build({
  entryPoints: PUBLIC_ENTRIES.map((name) => path.join(packageRoot, "src", `${name}.ts`)),
  outdir: distRoot,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node18",
  external,
  logLevel: "info",
});

const declarationRoot = fs.mkdtempSync(path.join(os.tmpdir(), "vitrine-declarations-"));
const tscPath = path.join(packageRoot, "node_modules", "typescript", "bin", "tsc");
try {
  execFileSync(
    process.execPath,
    [tscPath, "-p", "tsconfig.json", "--emitDeclarationOnly", "--outDir", declarationRoot],
    { cwd: packageRoot, stdio: "inherit" },
  );
  for (const name of PUBLIC_ENTRIES) {
    fs.copyFileSync(path.join(declarationRoot, `${name}.d.ts`), path.join(distRoot, `${name}.d.ts`));
  }
} finally {
  fs.rmSync(declarationRoot, { recursive: true, force: true });
}
