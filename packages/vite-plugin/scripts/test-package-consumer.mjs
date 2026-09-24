import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import vitrine, { GALLERY_ROUTE, MANIFEST_ROUTE } from "vite-plugin-react-vitrine";
import { getPreviewConfig, preview } from "vite-plugin-react-vitrine/preview";
import { createServer } from "vite";

/** test-package.mjs가 private protocol에서 읽어 전달한 runtime 계약 */
const contract = JSON.parse(process.env.VITRINE_CONTRACT ?? "{}");
const installedPluginRoot = path.join(process.cwd(), "node_modules", "vite-plugin-react-vitrine");

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  });
}

const installedPluginPackage = JSON.parse(
  fs.readFileSync(path.join(installedPluginRoot, "package.json"), "utf8"),
);
assert.equal(
  installedPluginPackage.dependencies?.["@vitrine/protocol"],
  undefined,
  "packed plugin still depends on the private protocol package",
);
assert.equal(
  fs.existsSync(path.join(process.cwd(), "node_modules", "@vitrine", "protocol")),
  false,
  "consumer install pulled in the private protocol package",
);
for (const file of listFiles(path.join(installedPluginRoot, "dist"))) {
  assert.doesNotMatch(
    fs.readFileSync(file, "utf8"),
    /@vitrine\/protocol/,
    `${path.relative(installedPluginRoot, file)} references the private protocol package`,
  );
}

assert.equal(GALLERY_ROUTE, contract.GALLERY_ROUTE);
assert.equal(MANIFEST_ROUTE, contract.MANIFEST_ROUTE);

const SampleComponent = () => null;
preview(SampleComponent, { args: { label: "sample" } });
assert.deepEqual(getPreviewConfig(SampleComponent), { args: { label: "sample" } });

const server = await createServer({
  root: process.cwd(),
  configFile: false,
  logLevel: "silent",
  plugins: [vitrine()],
  server: { host: "127.0.0.1", port: 0, strictPort: true },
});
const request = (url) =>
  fetch(url, {
    headers: { connection: "close" },
    signal: AbortSignal.timeout(10_000),
  });

try {
  await server.listen();
  const address = server.httpServer?.address();
  assert.ok(address && typeof address === "object", "Vite server did not bind a port");
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const galleryResponse = await request(`${baseUrl}${GALLERY_ROUTE}`);
  assert.equal(galleryResponse.status, 200);
  assert.match(galleryResponse.headers.get("content-type") ?? "", /^text\/html/);
  const galleryHtml = await galleryResponse.text();
  assert.match(galleryHtml, /id="vitrine-root"/);
  const galleryModulePath = [...galleryHtml.matchAll(/<script type="module" src="([^"]+)"/g)]
    .map((match) => match[1])
    .find((source) => source.includes(contract.GALLERY_MODULE_ID));
  assert.ok(galleryModulePath, "Gallery HTML did not reference its virtual module");

  const galleryModuleResponse = await request(new URL(galleryModulePath, baseUrl));
  assert.equal(galleryModuleResponse.status, 200);
  const galleryModule = await galleryModuleResponse.text();
  assert.match(galleryModule, /createRoot/);
  assert.ok(galleryModule.includes(contract.PREVIEWS_MODULE_ID));

  const previewsModuleResponse = await request(
    `${baseUrl}/@id/__x00__${contract.PREVIEWS_MODULE_ID}`,
  );
  assert.equal(previewsModuleResponse.status, 200);
  assert.match(await previewsModuleResponse.text(), /src\/Smoke\.tsx#Smoke/);

  const previewSourceResponse = await request(`${baseUrl}/src/Smoke.tsx`);
  assert.equal(previewSourceResponse.status, 200);
  assert.match(await previewSourceResponse.text(), /export function Smoke/);

  let manifest = [];
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const manifestResponse = await request(`${baseUrl}${MANIFEST_ROUTE}`);
    assert.equal(manifestResponse.status, 200);
    assert.match(manifestResponse.headers.get("content-type") ?? "", /^application\/json/);
    manifest = await manifestResponse.json();
    if (manifest.length > 0) break;
    await delay(100);
  }

  assert.equal(manifest.length, 1);
  assert.equal(manifest[0].id, "src/Smoke.tsx#Smoke");
  assert.equal(manifest[0].name, "Card");
  assert.equal(manifest[0].group, "Smoke");
  assert.equal(manifest[0].file, "src/Smoke.tsx");
  assert.equal(manifest[0].exportName, "Smoke");
  fs.writeFileSync("manifest.json", JSON.stringify(manifest));
} finally {
  server.httpServer?.closeAllConnections();
  await Promise.race([server.close(), delay(1_000)]);
}
