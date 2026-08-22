import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";
import ts from "typescript";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(packageRoot, "dist");
const watch = process.argv.includes("--watch");

fs.rmSync(distRoot, { recursive: true, force: true });
const buildOptions = {
  entryPoints: [path.join(packageRoot, "src", "extension.ts")],
  outfile: path.join(distRoot, "extension.js"),
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node18",
  external: ["vscode"],
  logLevel: "info",
};

if (!watch) {
  await esbuild.build(buildOptions);
} else {
  const context = await esbuild.context(buildOptions);
  await context.watch();

  const formatHost = {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => packageRoot,
    getNewLine: () => "\n",
  };
  const reportDiagnostic = (diagnostic) => {
    process.stderr.write(ts.formatDiagnosticWithColorAndContext(diagnostic, formatHost));
  };
  const reportWatchStatus = (diagnostic) => {
    process.stdout.write(ts.formatDiagnostic(diagnostic, formatHost));
  };
  const watchHost = ts.createWatchCompilerHost(
    path.join(packageRoot, "tsconfig.json"),
    { noEmit: true },
    ts.sys,
    ts.createSemanticDiagnosticsBuilderProgram,
    reportDiagnostic,
    reportWatchStatus,
  );
  const typeWatch = ts.createWatchProgram(watchHost);

  let closing = false;
  const close = async () => {
    if (closing) return;
    closing = true;
    typeWatch.close();
    await context.dispose();
    process.exit(0);
  };
  process.once("SIGINT", close);
  process.once("SIGTERM", close);
}
