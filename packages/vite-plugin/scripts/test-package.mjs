import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "vitrine-package-smoke-"));
const consumerRoot = path.join(tempRoot, "consumer");
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const galleryAssetPath = path.join(packageRoot, "dist", "gallery", "gallery-client.js");
const PUBLIC_FILES = [
  "README.md",
  "LICENSE",
  "dist/index.js",
  "dist/index.d.ts",
  "dist/preview.js",
  "dist/preview.d.ts",
];

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

function readInstalledVersion(name) {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(packageRoot, "node_modules", ...name.split("/"), "package.json"), "utf8"),
  );
  return packageJson.version;
}

function resolveDependencyRoot(packageDirectory, dependencyName) {
  const dependencySegments = dependencyName.split("/");
  let currentPath = packageDirectory;

  while (currentPath !== path.dirname(currentPath)) {
    const candidates = [path.join(currentPath, "node_modules", ...dependencySegments)];
    if (path.basename(currentPath) === "node_modules") {
      candidates.push(path.join(currentPath, ...dependencySegments));
    }
    for (const candidate of candidates) {
      if (fs.existsSync(path.join(candidate, "package.json"))) return fs.realpathSync(candidate);
    }
    currentPath = path.dirname(currentPath);
  }

  throw new Error(`Could not resolve ${dependencyName} from ${packageDirectory}`);
}

function collectBabelOverrides(entryNames) {
  const overrides = {};
  const queue = entryNames.map((name) =>
    fs.realpathSync(path.join(packageRoot, "node_modules", ...name.split("/"))),
  );

  while (queue.length > 0) {
    const packageDirectory = queue.shift();
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(packageDirectory, "package.json"), "utf8"),
    );
    if (overrides[packageJson.name]) continue;
    overrides[packageJson.name] = packageJson.version;

    for (const dependencyName of Object.keys(packageJson.dependencies ?? {})) {
      if (!dependencyName.startsWith("@babel/")) continue;
      queue.push(resolveDependencyRoot(packageDirectory, dependencyName));
    }
  }

  return overrides;
}

try {
  fs.rmSync(galleryAssetPath, { force: true });
  runPackageCommand(pnpmCommand, ["run", "build"], {
    cwd: packageRoot,
    stdio: "inherit",
  });
  assert.ok(fs.existsSync(galleryAssetPath), "build did not create the gallery asset");

  // 소비자에는 설치되지 않는 private protocol의 runtime 계약을 workspace build에서 조회
  const protocol = await import(
    pathToFileURL(path.resolve(packageRoot, "..", "protocol", "dist", "index.js")).href
  );

  const packOutput = runPackageCommand(
    pnpmCommand,
    ["pack", "--json", "--pack-destination", tempRoot],
    { cwd: packageRoot, encoding: "utf8" },
  );
  const packResult = parsePackResult(packOutput);
  assert.ok(packResult, "pnpm pack did not return package metadata");
  for (const filePath of [...PUBLIC_FILES, "dist/gallery/gallery-client.js"]) {
    assert.ok(
      packResult.files.some((file) => file.path === filePath),
      `packed package is missing ${filePath}`,
    );
  }
  assert.ok(
    packResult.files.every((file) => file.path !== "client/gallery-client.js"),
    "packed package contains the obsolete client gallery asset",
  );

  const tarballPath = resolvePackPath(packResult.filename);
  const consumerVersions = Object.fromEntries(
    ["vite", "react", "react-dom", "typescript", "@types/react", "@types/node"].map((name) => [
      name,
      readInstalledVersion(name),
    ]),
  );
  fs.mkdirSync(path.join(consumerRoot, "src"), { recursive: true });
  fs.writeFileSync(
    path.join(consumerRoot, "package.json"),
    JSON.stringify({
      name: "vitrine-package-smoke",
      private: true,
      type: "module",
      dependencies: {
        "vite-plugin-react-vitrine": `file:${tarballPath.split(path.sep).join("/")}`,
        ...consumerVersions,
      },
      pnpm: {
        overrides: collectBabelOverrides(["@babel/parser", "@babel/traverse"]),
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
        strict: true,
        skipLibCheck: false,
      },
      include: ["typecheck.mts"],
    }),
  );
  fs.writeFileSync(
    path.join(consumerRoot, "typecheck.mts"),
    [
      'import vitrine, { GALLERY_ROUTE, MANIFEST_ROUTE } from "vite-plugin-react-vitrine";',
      'import { preview } from "vite-plugin-react-vitrine/preview";',
      "",
      'const plugin = vitrine({ include: ["src/**/*.tsx"] });',
      "export const values: string[] = [GALLERY_ROUTE, MANIFEST_ROUTE, plugin.name];",
      "preview(() => null, { args: {} });",
      "",
    ].join("\n"),
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

  const contract = {
    GALLERY_ROUTE: protocol.GALLERY_ROUTE,
    MANIFEST_ROUTE: protocol.MANIFEST_ROUTE,
    GALLERY_MODULE_ID: protocol.GALLERY_MODULE_ID,
    PREVIEWS_MODULE_ID: protocol.PREVIEWS_MODULE_ID,
  };
  execFileSync(process.execPath, ["test-package-consumer.mjs"], {
    cwd: consumerRoot,
    stdio: "inherit",
    timeout: 60_000,
    env: { ...process.env, VITRINE_CONTRACT: JSON.stringify(contract) },
  });

  const manifest = JSON.parse(fs.readFileSync(path.join(consumerRoot, "manifest.json"), "utf8"));
  assert.equal(protocol.isManifest(manifest), true, "served manifest does not match the protocol contract");

  console.log("Vitrine package smoke test passed");
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
