import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const protocolRoot = path.resolve(packageRoot, "..", "protocol");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "vitrine-package-smoke-"));
const consumerRoot = path.join(tempRoot, "consumer");
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const galleryAssetPath = path.join(packageRoot, "dist", "gallery", "gallery-client.js");

function runPackageCommand(command, args, options) {
  if (process.platform !== "win32") return execFileSync(command, args, options);
  return execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", command, ...args], options);
}

function parsePackResult(output) {
  const parsed = JSON.parse(output);
  return Array.isArray(parsed) ? parsed[0] : parsed;
}

function resolvePackPath(filename) {
  return path.isAbsolute(filename) ? filename : path.join(tempRoot, filename);
}

try {
  fs.rmSync(galleryAssetPath, { force: true });
  runPackageCommand(pnpmCommand, ["run", "build"], {
    cwd: packageRoot,
    stdio: "inherit",
  });
  assert.ok(fs.existsSync(galleryAssetPath), "build did not create the gallery asset");

  const protocolPackOutput = runPackageCommand(
    pnpmCommand,
    ["pack", "--json", "--pack-destination", tempRoot],
    { cwd: protocolRoot, encoding: "utf8" },
  );
  const protocolPackResult = parsePackResult(protocolPackOutput);
  assert.ok(protocolPackResult, "pnpm pack did not return protocol package metadata");
  for (const filePath of ["dist/index.js", "dist/index.cjs", "dist/index.d.ts", "dist/index.d.cts"]) {
    assert.ok(
      protocolPackResult.files.some((file) => file.path === filePath),
      `packed protocol is missing ${filePath}`,
    );
  }

  const packOutput = runPackageCommand(
    pnpmCommand,
    ["pack", "--json", "--pack-destination", tempRoot],
    { cwd: packageRoot, encoding: "utf8" },
  );
  const packResult = parsePackResult(packOutput);
  assert.ok(packResult, "pnpm pack did not return package metadata");
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

  const tarballPath = resolvePackPath(packResult.filename);
  const protocolTarballPath = resolvePackPath(protocolPackResult.filename);
  const consumerVersions = Object.fromEntries(
    ["vite", "react", "react-dom", "typescript"].map((name) => {
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
        "@vitrine/protocol": `file:${protocolTarballPath.split(path.sep).join("/")}`,
        "@vitrine/vite-plugin": `file:${tarballPath.split(path.sep).join("/")}`,
        ...consumerVersions,
      },
      pnpm: {
        overrides: {
          "@vitrine/protocol": `file:${protocolTarballPath.split(path.sep).join("/")}`,
        },
      },
    }),
  );
  fs.writeFileSync(
    path.join(consumerRoot, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        module: "Node16",
        moduleResolution: "Node16",
        target: "ES2022",
      },
      include: ["typecheck.cts", "typecheck.mts"],
    }),
  );
  fs.writeFileSync(
    path.join(consumerRoot, "typecheck.cts"),
    'import protocol = require("@vitrine/protocol");\nconst route: string = protocol.GALLERY_ROUTE;\n',
  );
  fs.writeFileSync(
    path.join(consumerRoot, "typecheck.mts"),
    'import { GALLERY_ROUTE } from "@vitrine/protocol";\nconst route: string = GALLERY_ROUTE;\n',
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
  runPackageCommand(pnpmCommand, ["exec", "tsc", "--noEmit"], {
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
