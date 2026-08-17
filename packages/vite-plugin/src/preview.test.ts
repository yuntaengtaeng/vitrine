import { describe, expect, it } from "vitest";
import { getPreviewConfig, preview } from "./preview.js";

describe("preview registry", () => {
  it("등록한 config를 같은 컴포넌트로 조회 가능", () => {
    const Component = () => null;
    const config = { args: { title: "hello" } };
    preview(Component, config);
    expect(getPreviewConfig(Component)).toBe(config);
  });

  it("등록하지 않은 컴포넌트는 undefined", () => {
    const Component = () => null;
    expect(getPreviewConfig(Component)).toBeUndefined();
  });

  it("서로 다른 컴포넌트의 config가 섞이지 않음", () => {
    const A = () => null;
    const B = () => null;
    preview(A, { args: { label: "A" } });
    preview(B, { args: { label: "B" } });
    expect(getPreviewConfig(A)).toEqual({ args: { label: "A" } });
    expect(getPreviewConfig(B)).toEqual({ args: { label: "B" } });
  });
});
