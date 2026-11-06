import { describe, expect, it } from "vitest";
import { canUnset, controlTypeLabel } from "./controlType";

describe("controlTypeLabel", () => {
  it("기본 control은 TypeScript 타입 이름", () => {
    expect(controlTypeLabel({ type: "text", optional: false })).toBe("string");
    expect(controlTypeLabel({ type: "number", optional: false })).toBe("number");
    expect(controlTypeLabel({ type: "boolean", optional: false })).toBe("boolean");
  });

  it("선택지는 literal union, 문자열만 따옴표", () => {
    expect(controlTypeLabel({ type: "select", options: ["sm", 2], optional: false })).toBe('"sm" | 2');
    expect(controlTypeLabel({ type: "radio", options: ["info"], optional: false })).toBe('"info"');
  });

  it("선택지가 많으면 앞 세 개와 남은 개수", () => {
    expect(controlTypeLabel({ type: "select", options: ["a", "b", "c", "d", "e"], optional: false })).toBe(
      '"a" | "b" | "c" | 2 more',
    );
  });
});

describe("canUnset", () => {
  it("타입으로 확인된 optional control은 비울 수 있음", () => {
    expect(canUnset({ type: "select", options: ["a"], optional: true })).toBe(true);
  });

  it("필수로 분석되어 기본값이 있는 control은 비울 수 없음", () => {
    expect(canUnset({ type: "select", options: ["a", "b"], optional: false, defaultValue: "a" })).toBe(false);
  });

  it("직접 선언해 기본값이 없는 control은 optional이 아니어도 비울 수 있음", () => {
    expect(canUnset({ type: "select", options: ["a", "b"], optional: false })).toBe(true);
  });
});
