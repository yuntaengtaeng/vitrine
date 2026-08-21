import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import vitrine from "@vitrine/vite-plugin";
import { createServer } from "vite";

assert.ok(
  fs.existsSync(
    path.join(
      process.cwd(),
      "node_modules",
      "@vitrine",
      "vite-plugin",
      "dist",
      "gallery",
      "gallery-client.js",
    ),
  ),
  "installed tarball is missing the gallery asset",
);

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

  const galleryResponse = await request(`${baseUrl}/__vitrine`);
  assert.equal(galleryResponse.status, 200);
  assert.match(galleryResponse.headers.get("content-type") ?? "", /^text\/html/);
  const galleryHtml = await galleryResponse.text();
  assert.match(galleryHtml, /id="vitrine-root"/);
  const galleryModulePath = [...galleryHtml.matchAll(/<script type="module" src="([^"]+)"/g)]
    .map((match) => match[1])
    .find((source) => source.includes("virtual:vitrine-preview-gallery"));
  assert.ok(galleryModulePath, "Gallery HTML did not reference its virtual module");

  const galleryModuleResponse = await request(new URL(galleryModulePath, baseUrl));
  assert.equal(galleryModuleResponse.status, 200);
  const galleryModule = await galleryModuleResponse.text();
  assert.match(galleryModule, /createRoot/);
  assert.match(galleryModule, /virtual:vitrine-previews/);

  const previewsModuleResponse = await request(
    `${baseUrl}/@id/__x00__virtual:vitrine-previews`,
  );
  assert.equal(previewsModuleResponse.status, 200);
  assert.match(await previewsModuleResponse.text(), /src\/Smoke\.tsx#Smoke/);

  let manifest = [];
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const manifestResponse = await request(`${baseUrl}/__vitrine/manifest`);
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
} finally {
  server.httpServer?.closeAllConnections();
  await Promise.race([server.close(), delay(1_000)]);
}
