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

describe("named export comment fallback scope", () => {
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

  it("does not skip an unrelated statement to reach export const", () => {
    const entries = writeAndScan(
      [
        "/** @preview */",
        "const Unrelated = () => null;",
        "",
        "export const Exported = () => null;",
      ].join("\n"),
    );

    expect(entries).toHaveLength(0);
  });

  it("does not skip an unrelated statement to reach export function", () => {
    const entries = writeAndScan(
      [
        "/** @preview */",
        "const Unrelated = () => null;",
        "",
        "export function Exported() { return null; }",
      ].join("\n"),
    );

    expect(entries).toHaveLength(0);
  });

  it("does not skip an unrelated statement to reach export default function", () => {
    const entries = writeAndScan(
      [
        "/** @preview */",
        "const Unrelated = () => null;",
        "",
        "export default function Exported() { return null; }",
      ].join("\n"),
    );

    expect(entries).toHaveLength(0);
  });
});

describe("scan export default", () => {
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

  it("uses the named function's own name as the label", () => {
    const entries = writeAndScan(
      ["/** @preview */", "export default function PrimaryButton() { return null; }"].join("\n"),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].exportName).toBe("default");
    expect(entries[0].name).toBe("PrimaryButton");
    expect(entries[0].id).toBe("Button.tsx#default");
  });

  it("falls back to the file name for an anonymous default export", () => {
    const entries = writeAndScan(
      ["/** @preview */", "export default () => null;"].join("\n"),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].exportName).toBe("default");
    expect(entries[0].name).toBe("Button");
  });

  it("uses the referenced identifier's name for export default of a variable", () => {
    const entries = writeAndScan(
      ["const Wrapped = () => null;", "", "/** @preview */", "export default Wrapped;"].join("\n"),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe("Wrapped");
  });

  it("still honors an explicit name= option over any fallback", () => {
    const entries = writeAndScan(
      ["/** @preview name=Main button */", "export default () => null;"].join("\n"),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe("Main button");
  });

  it("ignores a default export with no @preview comment", () => {
    const entries = writeAndScan(["export default () => null;"].join("\n"));

    expect(entries).toHaveLength(0);
  });

  it("matches a comment above the const declared right before the export", () => {
    const entries = writeAndScan(
      ["/** @preview */", "const Chip = () => null;", "", "export default Chip;"].join("\n"),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe("Chip");
  });

  it("does not reach past an unrelated statement to grab an earlier comment", () => {
    const entries = writeAndScan(
      [
        "/** @preview */",
        "const Unrelated = () => null;",
        "",
        "const Exported = () => null;",
        "",
        "export default Exported;",
      ].join("\n"),
    );

    expect(entries).toHaveLength(0);
  });
});
