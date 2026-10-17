import { FRAME_PROTOCOL, type FrameReadyMessage } from "@vitrine/protocol";
import { describe, expect, it } from "vitest";
import { INITIAL_FRAME_STATUS, displayedArgs, reduceFrameStatus, startingSelection, toOverrideValue } from "./frameStatus";

describe("toOverrideValue", () => {
  it("비운 값은 null, 보낼 수 없는 값은 undefined", () => {
    expect(toOverrideValue(undefined)).toBeNull();
    expect(toOverrideValue("md")).toBe("md");
    expect(toOverrideValue(3)).toBe(3);
    expect(toOverrideValue(false)).toBe(false);
    expect(toOverrideValue(Number.NaN)).toBeUndefined();
    expect(toOverrideValue({})).toBeUndefined();
  });
});

const ready: FrameReadyMessage = {
  type: "frameReady",
  protocol: FRAME_PROTOCOL,
  controls: {},
  variants: [{ key: "danger", name: "Danger" }],
  initialVariantKey: "danger",
  defaultArgs: { label: "Save", size: "sm" },
  variantArgs: { danger: { label: "Delete", size: "sm" } },
  componentName: "Button",
  globals: {},
  defaultFixedGlobals: {},
  variantFixedGlobals: {},
  defaultFrameOnlyArgs: [],
  variantFrameOnlyArgs: { danger: [] },
};

describe("reduceFrameStatus", () => {
  it("ready를 받으면 준비 상태와 frame 정보를 기록하고 이전 에러를 지움", () => {
    const failed = reduceFrameStatus(INITIAL_FRAME_STATUS, { type: "frameError", message: "boom" });
    expect(failed.phase).toBe("error");

    const recovered = reduceFrameStatus(failed, ready);
    expect(recovered).toMatchObject({ phase: "ready", ready, error: null });
  });

  it("size는 단계를 바꾸지 않고 높이만 기록", () => {
    expect(reduceFrameStatus(INITIAL_FRAME_STATUS, { type: "frameSize", height: 88 })).toEqual({
      ...INITIAL_FRAME_STATUS,
      height: 88,
    });
  });
});

describe("displayedArgs", () => {
  it("선택한 variant 값 위에 사용자가 바꾼 값을 덮음", () => {
    expect(displayedArgs(ready, "danger", { size: "md" })).toEqual({ label: "Delete", size: "md" });
  });

  it("variant가 없으면 기본 args, 비운 값은 undefined", () => {
    expect(displayedArgs(ready, null, { size: null })).toEqual({ label: "Save", size: undefined });
  });
});

describe("startingSelection", () => {
  it("요청이 없으면 frame이 고른 초기 variant와 빈 값", () => {
    expect(startingSelection(ready, undefined)).toEqual({ variantKey: "danger", args: {} });
  });

  it("링크로 요청한 variant와 값으로 시작", () => {
    expect(startingSelection(ready, { variantKey: "danger", args: { label: "Go" } })).toEqual({
      variantKey: "danger",
      args: { label: "Go" },
    });
  });

  it("이 프리뷰에 없는 variant는 초기 variant로 바꾸고 값은 유지", () => {
    expect(startingSelection(ready, { variantKey: "ghost", args: { label: "Go" } })).toEqual({
      variantKey: "danger",
      args: { label: "Go" },
    });
  });
});
