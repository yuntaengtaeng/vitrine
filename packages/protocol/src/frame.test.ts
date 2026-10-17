import { describe, expect, it } from "vitest";
import { FRAME_PROTOCOL, isFrameToGalleryMessage, isGalleryToFrameMessage } from "./index.js";

const render = { type: "frameRender", protocol: FRAME_PROTOCOL, variantKey: null, args: {}, layout: { kind: "single" } };
const ready = {
  type: "frameReady",
  protocol: FRAME_PROTOCOL,
  controls: { size: { type: "radio", options: ["sm", "md"], optional: false, defaultValue: "sm" } },
  variants: [{ key: "primary", name: "Primary" }],
  initialVariantKey: "primary",
  defaultArgs: { size: "sm" },
  variantArgs: { primary: { size: "md", disabled: false, count: 2 } },
};

describe("isGalleryToFrameMessage", () => {
  it("render 상태 전체를 담은 메시지 허용", () => {
    expect(isGalleryToFrameMessage(render)).toBe(true);
    expect(isGalleryToFrameMessage({ ...render, variantKey: "danger", args: { label: "Delete", count: 3 } })).toBe(true);
  });

  it("다른 protocol 버전, 직렬화할 수 없는 args, 모르는 layout은 거부", () => {
    expect(isGalleryToFrameMessage({ ...render, protocol: FRAME_PROTOCOL + 1 })).toBe(false);
    expect(isGalleryToFrameMessage({ ...render, args: { onClick: {} } })).toBe(false);
    expect(isGalleryToFrameMessage({ ...render, args: { count: Number.NaN } })).toBe(false);
    expect(isGalleryToFrameMessage({ ...render, layout: { kind: "grid" } })).toBe(false);
    expect(isGalleryToFrameMessage({ ...render, variantKey: "" })).toBe(false);
  });
});

describe("isFrameToGalleryMessage", () => {
  it("ready, size, error 메시지 허용", () => {
    expect(isFrameToGalleryMessage(ready)).toBe(true);
    expect(isFrameToGalleryMessage({ type: "frameSize", height: 120 })).toBe(true);
    expect(isFrameToGalleryMessage({ type: "frameError", message: "boom", stack: "at Button" })).toBe(true);
  });

  it("control 형식이 틀리거나 variant args에 객체가 있으면 거부", () => {
    expect(isFrameToGalleryMessage({ ...ready, controls: { size: { type: "slider", optional: false } } })).toBe(false);
    expect(isFrameToGalleryMessage({ ...ready, variantArgs: { primary: { icon: {} } } })).toBe(false);
    expect(isFrameToGalleryMessage({ ...ready, variants: [{ key: "", name: "Empty" }] })).toBe(false);
  });

  it("음수 높이와 모르는 type은 거부", () => {
    expect(isFrameToGalleryMessage({ type: "frameSize", height: -1 })).toBe(false);
    expect(isFrameToGalleryMessage({ type: "frameAction" })).toBe(false);
  });
});
