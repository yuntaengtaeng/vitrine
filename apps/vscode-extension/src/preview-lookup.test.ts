import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  findEntryAtLine,
  resolveCursorPreviewId,
  toProjectRelativeFile,
  type ManifestEntry,
} from "./preview-lookup.js";

describe("toProjectRelativeFile", () => {
  const root = path.join("C:", "proj");

  it("returns a posix relative path for a file inside the root", () => {
    const file = path.join(root, "src", "Button.tsx");
    expect(toProjectRelativeFile(root, file)).toBe("src/Button.tsx");
  });

  it("returns null for a file outside the root", () => {
    const file = path.join("C:", "other", "src", "Button.tsx");
    expect(toProjectRelativeFile(root, file)).toBeNull();
  });

  it("returns null for the root itself", () => {
    expect(toProjectRelativeFile(root, root)).toBeNull();
  });
});

describe("findEntryAtLine", () => {
  const manifest: ManifestEntry[] = [
    { id: "a", name: "A", file: "src/Button.tsx", exportName: "A", startLine: 4, endLine: 4, controls: {} },
    { id: "b", name: "B", file: "src/Button.tsx", exportName: "B", startLine: 7, endLine: 9, controls: {} },
    { id: "c", name: "C", file: "src/Badge.tsx", exportName: "C", startLine: 4, endLine: 4, controls: {} },
  ];

  it("matches a single-line entry exactly", () => {
    expect(findEntryAtLine(manifest, "src/Button.tsx", 4)?.id).toBe("a");
  });

  it("matches anywhere within a multi-line entry's range, inclusive", () => {
    expect(findEntryAtLine(manifest, "src/Button.tsx", 7)?.id).toBe("b");
    expect(findEntryAtLine(manifest, "src/Button.tsx", 8)?.id).toBe("b");
    expect(findEntryAtLine(manifest, "src/Button.tsx", 9)?.id).toBe("b");
  });

  it("returns null just outside a range", () => {
    expect(findEntryAtLine(manifest, "src/Button.tsx", 6)).toBeNull();
    expect(findEntryAtLine(manifest, "src/Button.tsx", 10)).toBeNull();
  });

  it("does not match an entry from a different file on the same line", () => {
    expect(findEntryAtLine(manifest, "src/Other.tsx", 4)).toBeNull();
  });
});

describe("resolveCursorPreviewId", () => {
  const manifest: ManifestEntry[] = [
    { id: "a", name: "A", file: "src/Button.tsx", exportName: "A", startLine: 4, endLine: 4, controls: {} },
  ];
  const base = { manifest, relFile: "src/Button.tsx", lastSelectedId: null };

  it("converts the 0-indexed cursor line to the manifest's 1-indexed range", () => {
    expect(resolveCursorPreviewId({ ...base, cursorLine: 3 })).toBe("a");
    expect(resolveCursorPreviewId({ ...base, cursorLine: 4 })).toBeNull();
  });

  it("returns null when the preview is already selected", () => {
    expect(resolveCursorPreviewId({ ...base, cursorLine: 3, lastSelectedId: "a" })).toBeNull();
  });
});
