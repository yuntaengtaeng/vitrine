import { describe, expect, it } from "vitest";
import { stackFrames } from "./errorDetails";

const ORIGIN = "http://localhost:5173";

describe("stackFrames", () => {
  it("V8 stack 첫머리의 에러 이름과 메시지를 빼고 호출 위치만 남김", () => {
    const stack = "TypeError: Cannot read x\n    at Button (Button.tsx:3:9)\n    at render (react.js:1:1)";
    expect(stackFrames({ message: "Cannot read x", stack }, ORIGIN).map((frame) => frame.text)).toEqual([
      "at Button (Button.tsx:3:9)",
      "at render (react.js:1:1)",
    ]);
  });

  it("여러 줄 메시지도 한 번에 뺌", () => {
    const stack = "Error: first\nsecond\n    at A (a.tsx:1:1)";
    expect(stackFrames({ message: "first\nsecond", stack }, ORIGIN)).toEqual([{ text: "at A (a.tsx:1:1)", library: false }]);
  });

  it("dev server origin과 Vite 캐시 쿼리를 지우고 node_modules 호출을 구분", () => {
    const stack = [
      "Error: boom",
      `    at ErrorDemo (${ORIGIN}/src/ErrorDemo.tsx:3:26)`,
      `    at renderWithHooks (${ORIGIN}/node_modules/.vite/deps/chunk-V64J.js?v=388789a4:1159:26)`,
    ].join("\n");
    expect(stackFrames({ message: "boom", stack }, ORIGIN)).toEqual([
      { text: "at ErrorDemo (src/ErrorDemo.tsx:3:26)", library: false },
      { text: "at renderWithHooks (node_modules/.vite/deps/chunk-V64J.js:1159:26)", library: true },
    ]);
  });

  it("메시지가 없는 Firefox 형식 stack은 그대로", () => {
    expect(stackFrames({ message: "boom", stack: "A@a.tsx:1:1\nB@b.tsx:2:2" }, ORIGIN).map((frame) => frame.text)).toEqual([
      "A@a.tsx:1:1",
      "B@b.tsx:2:2",
    ]);
  });

  it("stack이 없거나 메시지뿐이면 빈 목록", () => {
    expect(stackFrames({ message: "boom" }, ORIGIN)).toEqual([]);
    expect(stackFrames({ message: "boom", stack: "Error: boom" }, ORIGIN)).toEqual([]);
  });
});
