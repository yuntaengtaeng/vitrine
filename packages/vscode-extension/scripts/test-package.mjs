import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "vitrine-extension-package-"));
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function runPnpm(args, options) {
  if (process.platform !== "win32") return execFileSync(pnpmCommand, args, options);
  return execFileSync(
    process.env.ComSpec ?? "cmd.exe",
    ["/d", "/s", "/c", pnpmCommand, ...args],
    options,
  );
}

try {
  const extensionBundlePath = path.join(packageRoot, "dist", "extension.js");
  assert.ok(fs.existsSync(extensionBundlePath), "extension build is missing dist/extension.js");
  const extensionBundle = fs.readFileSync(extensionBundlePath, "utf8");
  assert.doesNotMatch(
    extensionBundle,
    /require\(["']@vitrine\/protocol["']\)/,
    "extension bundle contains an external protocol runtime dependency",
  );

  const packOutput = runPnpm(["pack", "--json", "--pack-destination", tempRoot], {
    cwd: packageRoot,
    encoding: "utf8",
  });
  const parsedPackResult = JSON.parse(packOutput);
  const packResult = Array.isArray(parsedPackResult) ? parsedPackResult[0] : parsedPackResult;
  assert.ok(packResult, "pnpm pack did not return extension package metadata");
  assert.ok(
    packResult.files.some((file) => file.path === "dist/extension.js"),
    "extension package is missing dist/extension.js",
  );

  console.log("Vitrine extension package smoke test passed");
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
