import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const packageJsonPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8")) as {
  peerDependencies: Record<string, string>;
  compatiblePackages: { vite: { type: string; versions: string } };
};

describe("Vite Plugin Registry metadata", () => {
  it("compatiblePackages의 Vite 지원 범위를 peerDependencies와 일치", () => {
    expect(packageJson.compatiblePackages.vite).toMatchObject({
      type: "compatible",
      versions: packageJson.peerDependencies.vite,
    });
  });
});
