import { describe, expect, it } from "vitest";
import { mergeControls, resolveInitialArgs } from "./Controls";

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
});
