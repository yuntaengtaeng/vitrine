import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { scanFile } from "./scan.js";

describe("scan line ranges", () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "vitrine-scan-test-"));
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  function writeAndScan(code: string): ReturnType<typeof scanFile> {
    const file = path.join(root, "Button.tsx");
    fs.writeFileSync(file, code, "utf-8");
    return scanFile(file, root);
  }

  it("gives a single-line export a startLine equal to endLine", () => {
    const entries = writeAndScan(
      [
        "export function Button() { return null; }",
        "",
        "/** @preview */",
        "export const PrimaryButton = () => Button();",
      ].join("\n"),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].startLine).toBe(entries[0].endLine);
    expect(entries[0].startLine).toBe(4);
  });

  it("spans the full declaration for a multi-line export", () => {
    const entries = writeAndScan(
      [
        "export function Button() { return null; }",
        "",
        "/** @preview */",
        "export const WrappedButton = () => {",
        "  return Button();",
        "};",
      ].join("\n"),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].startLine).toBe(4);
    expect(entries[0].endLine).toBe(6);
  });

  it("gives independent ranges to multiple previews in one file", () => {
    const entries = writeAndScan(
      [
        "export function Button() { return null; }",
        "",
        "/** @preview */",
        "export const First = () => Button();",
        "",
        "/** @preview */",
        "export const Second = () => Button();",
      ].join("\n"),
    );

    expect(entries).toHaveLength(2);
    expect(entries.find((e) => e.exportName === "First")?.startLine).toBe(4);
    expect(entries.find((e) => e.exportName === "Second")?.startLine).toBe(7);
  });
});
