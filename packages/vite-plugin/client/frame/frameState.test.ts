import { isFrameToGalleryMessage } from "@vitrine/protocol";
import { describe, expect, it } from "vitest";
import { buildFrameReady, resolveFrameArgs, toFrameArgs } from "./frameState";

const inferred = {
  label: { type: "text" as const, optional: false, defaultValue: "" },
  size: { type: "select" as const, options: ["sm", "md"], optional: false, defaultValue: "sm" },
};
const onClick = () => {};
const config = {
  args: { label: "Save", onClick },
  controls: { size: "radio" as const },
  variants: {
    primary: { name: "Primary", args: { size: "md" } },
    danger: { args: { label: "Delete" } },
  },
};

describe("toFrameArgs", () => {
  it("함수, 객체, NaN은 빼고 문자열, 숫자, boolean만 남김", () => {
    expect(toFrameArgs({ a: "x", b: 1, c: false, d: onClick, e: { x: 1 }, f: Number.NaN, g: null })).toEqual({
      a: "x",
      b: 1,
      c: false,
    });
  });
});

describe("buildFrameReady", () => {
  it("override를 반영한 control, variant, 직렬화 가능한 args로 계약에 맞는 메시지 생성", () => {
    const ready = buildFrameReady(inferred, config);
    expect(isFrameToGalleryMessage(ready)).toBe(true);
    expect(ready.controls.size.type).toBe("radio");
    expect(ready.variants).toEqual([
      { key: "primary", name: "Primary" },
      { key: "danger", name: "danger" },
    ]);
    expect(ready.initialVariantKey).toBe("primary");
    expect(ready.defaultArgs).toEqual({ label: "Save", size: "sm" });
    expect(ready.variantArgs.danger).toEqual({ label: "Delete", size: "sm" });
  });
});

describe("resolveFrameArgs", () => {
  it("Gallery 메시지 전에는 첫 variant 기준 원본 args 사용 (함수 포함)", () => {
    expect(resolveFrameArgs(inferred, config, null)).toEqual({ label: "Save", size: "md", onClick });
  });

  it("선택한 variant 위에 Gallery에서 바꾼 값만 덮어쓰고 함수는 유지", () => {
    const args = resolveFrameArgs(inferred, config, { variantKey: "danger", args: { size: "md" } });
    expect(args).toEqual({ label: "Delete", size: "md", onClick });
  });

  it("Gallery에서 비운 선택 prop(null)은 undefined로 전달", () => {
    const args = resolveFrameArgs(inferred, config, { variantKey: null, args: { size: null } });
    expect(args).toEqual({ label: "Save", size: undefined, onClick });
  });

  it("variant를 고르지 않으면 preview() args 기준", () => {
    expect(resolveFrameArgs(inferred, config, { variantKey: null, args: {} })).toEqual({
      label: "Save",
      size: "sm",
      onClick,
    });
  });
});
