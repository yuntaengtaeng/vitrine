import { describe, expect, it } from "vitest";
import {
  isExtensionToGalleryMessage,
  isManifest,
  isPortFileData,
  isWebviewToExtensionMessage,
} from "./index.js";

const manifestEntry = {
  id: "src/Button.tsx#Button",
  name: "Button",
  group: "Inputs",
  file: "src/Button.tsx",
  exportName: "Button",
  startLine: 3,
  endLine: 5,
  controls: {
    tone: {
      type: "select",
      options: ["primary", "danger"],
      optional: false,
      defaultValue: "primary",
    },
  },
};

describe("isManifest", () => {
  it("accepts a complete entry and an omitted group", () => {
    expect(isManifest([manifestEntry])).toBe(true);
    const { group: _group, ...withoutGroup } = manifestEntry;
    expect(isManifest([withoutGroup])).toBe(true);
  });

  it.each([
    null,
    {},
    [{ ...manifestEntry, file: 1 }],
    [{ ...manifestEntry, startLine: 0 }],
    [{ ...manifestEntry, startLine: 2.5 }],
    [{ ...manifestEntry, startLine: 6 }],
    [{ ...manifestEntry, controls: { tone: { type: "unknown", optional: false } } }],
    [{ ...manifestEntry, controls: { tone: { type: "select", optional: false, options: [NaN] } } }],
  ])("rejects invalid manifest payload %#", (value) => {
    expect(isManifest(value)).toBe(false);
  });
});

describe("isPortFileData", () => {
  it("accepts a valid port and pid", () => {
    expect(isPortFileData({ port: 5173, pid: 1234 })).toBe(true);
  });

  it.each([
    { port: "5173", pid: 1234 },
    { port: 0, pid: 1234 },
    { port: 65_536, pid: 1234 },
    { port: 5173.5, pid: 1234 },
    { port: 5173, pid: 0 },
    { port: 5173, pid: Number.POSITIVE_INFINITY },
  ])("rejects invalid port file data %#", (value) => {
    expect(isPortFileData(value)).toBe(false);
  });
});

describe("message validators", () => {
  it("accepts webview messages in their allowed direction", () => {
    expect(isWebviewToExtensionMessage({ type: "switchProject" })).toBe(true);
    expect(isWebviewToExtensionMessage({ type: "previewSelected", id: "preview-id" })).toBe(true);
  });

  it("accepts an extension selection message", () => {
    expect(isExtensionToGalleryMessage({ type: "selectPreview", id: "preview-id" })).toBe(true);
  });

  it("rejects missing ids, unknown messages and opposite directions", () => {
    expect(isWebviewToExtensionMessage({ type: "previewSelected", id: "" })).toBe(false);
    expect(isWebviewToExtensionMessage({ type: "selectPreview", id: "preview-id" })).toBe(false);
    expect(isExtensionToGalleryMessage({ type: "previewSelected", id: "preview-id" })).toBe(false);
    expect(isExtensionToGalleryMessage({ type: "unknown" })).toBe(false);
  });
});
