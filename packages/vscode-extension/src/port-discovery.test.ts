import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  findPortFileUpward,
  findPortFilesInWorkspace,
  isProcessAlive,
} from "./port-discovery.js";

function writePortFile(root: string, port: number, pid: number): void {
  const dir = path.join(root, ".vitrine");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "port.json"), JSON.stringify({ port, pid }), "utf-8");
}

describe("port-discovery", () => {
  let workspace: string;

  beforeEach(() => {
    workspace = fs.mkdtempSync(path.join(os.tmpdir(), "vitrine-ws-"));
  });

  afterEach(() => {
    fs.rmSync(workspace, { recursive: true, force: true });
  });

  it("finds the nearest port file walking up from a nested file", () => {
    const projectRoot = path.join(workspace, "packages", "app");
    fs.mkdirSync(path.join(projectRoot, "src"), { recursive: true });
    writePortFile(projectRoot, 5173, process.pid);

    const activeFile = path.join(projectRoot, "src", "Button.tsx");
    fs.writeFileSync(activeFile, "");

    expect(findPortFileUpward(activeFile)).toEqual({
      root: projectRoot,
      port: 5173,
      pid: process.pid,
    });
  });

  it("returns null when no port file exists above", () => {
    const activeFile = path.join(workspace, "src", "Button.tsx");
    fs.mkdirSync(path.dirname(activeFile), { recursive: true });
    fs.writeFileSync(activeFile, "");

    expect(findPortFileUpward(activeFile)).toBeNull();
  });

  it("finds multiple port files across a workspace", () => {
    const appA = path.join(workspace, "apps", "a");
    const appB = path.join(workspace, "apps", "b");
    fs.mkdirSync(appA, { recursive: true });
    fs.mkdirSync(appB, { recursive: true });
    writePortFile(appA, 5173, process.pid);
    writePortFile(appB, 5174, process.pid);

    const matches = findPortFilesInWorkspace([workspace]);
    expect(matches.map((m) => m.port).sort()).toEqual([5173, 5174]);
  });

  it("skips node_modules while scanning", () => {
    const nested = path.join(workspace, "node_modules", "some-pkg");
    fs.mkdirSync(nested, { recursive: true });
    writePortFile(nested, 9999, process.pid);

    expect(findPortFilesInWorkspace([workspace])).toHaveLength(0);
  });

  it("reports the current process as alive", () => {
    expect(isProcessAlive(process.pid)).toBe(true);
  });

  it("reports an unlikely pid as not alive", () => {
    expect(isProcessAlive(999999)).toBe(false);
  });
});
