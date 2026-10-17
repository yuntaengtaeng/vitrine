import { describe, expect, it } from "vitest";
import { controlTypeLabel } from "./controlType";

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
