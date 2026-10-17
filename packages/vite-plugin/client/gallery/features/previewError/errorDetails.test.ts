import { describe, expect, it } from "vitest";
import { stackFrames } from "./errorDetails";

describe("stackFrames", () => {
  it("V8 stack 첫머리의 에러 이름과 메시지를 빼고 호출 위치만 남김", () => {
    const stack = "TypeError: Cannot read x\n    at Button (Button.tsx:3:9)\n    at render (react.js:1:1)";
    expect(stackFrames({ message: "Cannot read x", stack })).toBe(
      "    at Button (Button.tsx:3:9)\n    at render (react.js:1:1)",
    );
  });

  it("여러 줄 메시지도 한 번에 뺌", () => {
    const stack = "Error: first\nsecond\n    at A (a.tsx:1:1)";
    expect(stackFrames({ message: "first\nsecond", stack })).toBe("    at A (a.tsx:1:1)");
  });

  it("메시지가 없는 Firefox 형식 stack은 그대로", () => {
    expect(stackFrames({ message: "boom", stack: "A@a.tsx:1:1\nB@b.tsx:2:2" })).toBe("A@a.tsx:1:1\nB@b.tsx:2:2");
  });

  it("stack이 없거나 메시지뿐이면 null", () => {
    expect(stackFrames({ message: "boom" })).toBeNull();
    expect(stackFrames({ message: "boom", stack: "Error: boom" })).toBeNull();
  });
});
