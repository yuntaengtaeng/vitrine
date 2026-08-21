import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "vitrine-package-smoke-"));
const consumerRoot = path.join(tempRoot, "consumer");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const galleryAssetPath = path.join(packageRoot, "dist", "gallery", "gallery-client.js");
const npmEnv = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.toLowerCase().startsWith("npm_config_")),
);

function runPackageCommand(command, args, options) {
  if (process.platform !== "win32") return execFileSync(command, args, options);
  return execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", command, ...args], options);
}

try {
  fs.rmSync(galleryAssetPath, { force: true });
  runPackageCommand(pnpmCommand, ["run", "build"], {
    cwd: packageRoot,
    stdio: "inherit",
  });
  assert.ok(fs.existsSync(galleryAssetPath), "build did not create the gallery asset");

  const packOutput = runPackageCommand(
    npmCommand,
    ["pack", "--json", "--pack-destination", tempRoot],
    {
      cwd: packageRoot,
      encoding: "utf8",
      env: { ...npmEnv, npm_config_cache: path.join(tempRoot, "npm-cache") },
    },
  );
  const [packResult] = JSON.parse(packOutput);
  assert.ok(packResult, "npm pack did not return package metadata");
  assert.ok(
    packResult.files.some((file) => file.path === "dist/gallery/gallery-client.js"),
    "packed package is missing dist/gallery/gallery-client.js",
  );
  assert.ok(
    packResult.files.some((file) => file.path === "dist/index.js"),
    "packed package is missing dist/index.js",
  );
  assert.ok(
    packResult.files.every((file) => file.path !== "client/gallery-client.js"),
    "packed package contains the obsolete client gallery asset",
  );

  const tarballPath = path.join(tempRoot, packResult.filename);
  const peerVersions = Object.fromEntries(
    ["vite", "react", "react-dom"].map((name) => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(packageRoot, "node_modules", name, "package.json"), "utf8"),
      );
      return [name, packageJson.version];
    }),
  );
  fs.mkdirSync(path.join(consumerRoot, "src"), { recursive: true });
  fs.writeFileSync(
    path.join(consumerRoot, "package.json"),
    JSON.stringify({
      name: "vitrine-package-smoke",
      private: true,
      type: "module",
      dependencies: {
        "@vitrine/vite-plugin": `file:${tarballPath.split(path.sep).join("/")}`,
        ...peerVersions,
      },
    }),
  );
  fs.writeFileSync(
    path.join(consumerRoot, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        jsx: "react-jsx",
        module: "ESNext",
        moduleResolution: "Bundler",
        target: "ES2022",
      },
      include: ["src"],
    }),
  );
  fs.writeFileSync(
    path.join(consumerRoot, "src", "Smoke.tsx"),
    "/** @preview name=\"Smoke/Card\" */\nexport function Smoke() {\n  return <button>Smoke</button>;\n}\n",
  );
  fs.copyFileSync(
    path.join(packageRoot, "scripts", "test-package-consumer.mjs"),
    path.join(consumerRoot, "test-package-consumer.mjs"),
  );

  runPackageCommand(pnpmCommand, ["install", "--offline"], {
    cwd: consumerRoot,
    stdio: "inherit",
  });
  execFileSync(process.execPath, ["test-package-consumer.mjs"], {
    cwd: consumerRoot,
    stdio: "inherit",
    timeout: 60_000,
  });

  console.log("Vitrine package smoke test passed");
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
