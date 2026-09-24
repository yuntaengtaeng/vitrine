import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "vitrine-extension-package-"));
const vsceBin = path.join(packageRoot, "node_modules", "@vscode", "vsce", "vsce");
const REQUIRED_FILES = ["package.json", "README.md", "LICENSE", "dist/extension.js"];

function runVsce(args) {
  return execFileSync(process.execPath, [vsceBin, ...args], { cwd: packageRoot, encoding: "utf8" });
}

try {
  const extensionBundlePath = path.join(packageRoot, "dist", "extension.js");
  assert.ok(fs.existsSync(extensionBundlePath), "extension build is missing dist/extension.js");
  assert.doesNotMatch(
    fs.readFileSync(extensionBundlePath, "utf8"),
    /require\(["']@vitrine\/protocol["']\)/,
    "extension bundle contains an external protocol runtime dependency",
  );

  const packagedFiles = runVsce(["ls", "--no-dependencies"])
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  for (const file of REQUIRED_FILES) {
    assert.ok(packagedFiles.includes(file), `VSIX is missing ${file}`);
  }
  assert.ok(
    packagedFiles.every((file) => !file.startsWith("src/") && !file.startsWith("scripts/")),
    `VSIX contains source files: ${packagedFiles.join(", ")}`,
  );

  // 실제 VSIX 생성으로 publisher, engines 등 manifest 검증까지 수행
  const vsixPath = path.join(tempRoot, "vitrine.vsix");
  runVsce(["package", "--no-dependencies", "--out", vsixPath]);
  assert.ok(fs.statSync(vsixPath).size > 0, "vsce produced an empty VSIX");

  console.log("Vitrine extension package smoke test passed");
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
