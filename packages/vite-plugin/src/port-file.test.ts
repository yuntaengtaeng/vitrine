import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getPortFilePath, removePortFile, writePortFile } from "./port-file.js";

describe("port-file", () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "vitrine-test-"));
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("writes port and pid to the port file", () => {
    writePortFile(root, { port: 5173, pid: 1234 });
    const data = JSON.parse(fs.readFileSync(getPortFilePath(root), "utf-8"));
    expect(data).toEqual({ port: 5173, pid: 1234 });
  });

  it("writes a gitignore that excludes the whole directory", () => {
    writePortFile(root, { port: 5173, pid: 1234 });
    const gitignore = fs.readFileSync(path.join(root, ".vitrine", ".gitignore"), "utf-8");
    expect(gitignore.trim()).toBe("*");
  });

  it("does not throw when removing an absent port file", () => {
    expect(() => removePortFile(root)).not.toThrow();
  });

  it("removes an existing port file", () => {
    writePortFile(root, { port: 5173, pid: 1234 });
    removePortFile(root);
    expect(fs.existsSync(getPortFilePath(root))).toBe(false);
  });
});
