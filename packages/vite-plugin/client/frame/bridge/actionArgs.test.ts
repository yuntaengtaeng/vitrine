import { describe, expect, it } from "vitest";
import { formatActionArg } from "./actionArgs";

describe("formatActionArg", () => {
  it("원시 값은 그대로, 문자열은 따옴표", () => {
    expect(formatActionArg("ok")).toBe('"ok"');
    expect(formatActionArg(3)).toBe("3");
    expect(formatActionArg(false)).toBe("false");
    expect(formatActionArg(null)).toBe("null");
    expect(formatActionArg(undefined)).toBe("undefined");
  });

  it("React 이벤트와 DOM 요소는 종류만", () => {
    expect(formatActionArg({ nativeEvent: {}, type: "click", target: {} })).toBe("[event click]");
    expect(formatActionArg({ nodeName: "BUTTON" })).toBe("<button>");
  });

  it("객체는 JSON, 순환 참조는 생성자 이름, 긴 값은 자름", () => {
    expect(formatActionArg({ id: 1 })).toBe('{"id":1}');
    const loop: Record<string, unknown> = {};
    loop.self = loop;
    expect(formatActionArg(loop)).toBe("[Object]");
    expect(formatActionArg("x".repeat(200))).toHaveLength(123);
  });

  it("함수는 이름만", () => {
    expect(formatActionArg(function save() {})).toBe("[function save]");
  });
});
