import { describe, expect, it } from "vitest";
import { isExtensionToGalleryMessage, isWebviewToExtensionMessage } from "./index.js";
import { isVariantEditResponse } from "./variants.js";

const edits = [{ start: 0, end: 0, text: "x" }];

describe("Save as variant contracts", () => {
  it("plugin 편집 응답은 성공이면 파일, hash, 편집, key를, 실패면 이유를 가짐", () => {
    expect(isVariantEditResponse({ ok: true, file: "/a.tsx", contentHash: "ab", edits, key: "big" })).toBe(true);
    expect(isVariantEditResponse({ ok: false, reason: "nope" })).toBe(true);
    expect(isVariantEditResponse({ ok: true, file: "/a.tsx", contentHash: "ab", edits: [{ start: 3, end: 1, text: "" }], key: "k" })).toBe(false);
  });

  it("확장 요청과 결과는 정해진 방향으로만", () => {
    const request = { type: "saveVariant", file: "/a.tsx", contentHash: "ab", edits, key: "big" };
    expect(isWebviewToExtensionMessage(request)).toBe(true);
    expect(isExtensionToGalleryMessage(request)).toBe(false);
    expect(isExtensionToGalleryMessage({ type: "saveVariantResult", ok: false, reason: "changed" })).toBe(true);
    expect(isExtensionToGalleryMessage({ type: "saveVariantResult", ok: true })).toBe(false);
  });
});
