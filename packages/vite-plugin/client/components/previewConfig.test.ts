import { describe, expect, it } from "vitest";
import {
  getInitialVariantKey,
  isPreviewComponent,
  mergeControls,
  resolveInitialArgs,
  resolveVariantArgs,
  toVariantOptions,
} from "./previewConfig";

describe("isPreviewComponent", () => {
  it("함수 컴포넌트를 허용", () => {
    expect(isPreviewComponent(() => null)).toBe(true);
  });

  it("컴포넌트가 아닌 값은 거부", () => {
    expect(isPreviewComponent(undefined)).toBe(false);
    expect(isPreviewComponent("Button")).toBe(false);
    expect(isPreviewComponent({ label: "not a component" })).toBe(false);
  });
});

describe("mergeControls", () => {
  it("추론된 control을 override로 부분 재정의", () => {
    const inferred = { tone: { type: "select", options: ["info", "success"], optional: false, defaultValue: "info" } };
    const result = mergeControls(inferred, { tone: "radio" });
    expect(result.tone).toEqual({ type: "radio", options: ["info", "success"], optional: false, defaultValue: "info" });
  });

  it("추론 대상이 아닌 prop도 controls 객체형 설정으로 직접 추가", () => {
    const result = mergeControls({}, { mode: { type: "radio", options: ["compact", "comfortable"] } });
    expect(result.mode).toEqual({ type: "radio", options: ["compact", "comfortable"], optional: true });
  });

  it("override가 없으면 추론 결과를 그대로 유지", () => {
    const inferred = { count: { type: "number", optional: false, defaultValue: 0 } };
    expect(mergeControls(inferred)).toEqual(inferred);
  });
});

describe("resolveInitialArgs", () => {
  it("control 기본값 위에 preview() args를 덮어씀", () => {
    const controls = {
      title: { type: "text", optional: false, defaultValue: "" },
      amount: { type: "number", optional: false, defaultValue: 0 },
    };
    const result = resolveInitialArgs(controls, { title: "Configured" });
    expect(result).toEqual({ title: "Configured", amount: 0 });
  });

  it("control이 없는 prop도 registeredArgs로 그대로 전달", () => {
    const user = { name: "Vitrine" };
    const result = resolveInitialArgs({}, { user, tags: ["a", "b"] });
    expect(result).toEqual({ user, tags: ["a", "b"] });
  });

  it("registeredArgs가 없으면 control 기본값만 사용", () => {
    const controls = { enabled: { type: "boolean", optional: false, defaultValue: false } };
    expect(resolveInitialArgs(controls, undefined)).toEqual({ enabled: false });
  });

  it("registeredArgs에 명시적 undefined가 있으면 기본값을 덮어써 unset 상태로 유지", () => {
    const controls = { hint: { type: "text", optional: true } };
    const result = resolveInitialArgs(controls, { hint: undefined });
    expect(result).toHaveProperty("hint", undefined);
  });

  it("variantArgs가 있으면 control 기본값과 registeredArgs를 모두 덮어씀", () => {
    const controls = { tone: { type: "select", options: ["info", "danger"], optional: false, defaultValue: "info" } };
    const result = resolveInitialArgs(controls, { tone: "danger", label: "base" }, { tone: "info", disabled: true });
    expect(result).toEqual({ tone: "info", label: "base", disabled: true });
  });
});

describe("variant 선택", () => {
  const config = {
    args: { label: "base" },
    variants: {
      primary: { args: { tone: "info" } },
      danger: { name: "Danger state", args: { tone: "danger" } },
    },
  };

  it("defaultVariant가 없으면 첫 variant 키를 기본으로 사용", () => {
    expect(getInitialVariantKey(config)).toBe("primary");
    expect(getInitialVariantKey({ ...config, defaultVariant: "danger" })).toBe("danger");
    expect(getInitialVariantKey({})).toBeUndefined();
  });

  it("variant 이름이 없으면 키를 표시 이름으로 사용", () => {
    expect(toVariantOptions(config)).toEqual([
      { key: "primary", name: "primary" },
      { key: "danger", name: "Danger state" },
    ]);
  });

  it("선택한 variant args를 preview() args 위에 덮어씀", () => {
    expect(resolveVariantArgs({}, config, "danger")).toEqual({ label: "base", tone: "danger" });
    expect(resolveVariantArgs({}, config, undefined)).toEqual({ label: "base" });
  });
});
