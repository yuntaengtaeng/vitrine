import { describe, expect, it } from "vitest";
import { isTypingTarget } from "./useFocusShortcut";

const element = (tagName: string, isContentEditable = false) =>
  ({ tagName, isContentEditable }) as unknown as EventTarget;

describe("isTypingTarget", () => {
  it("입력 요소에서는 단축키를 가로채지 않음", () => {
    expect(isTypingTarget(element("INPUT"))).toBe(true);
    expect(isTypingTarget(element("TEXTAREA"))).toBe(true);
    expect(isTypingTarget(element("SELECT"))).toBe(true);
  });

  it("contenteditable 요소에서는 단축키를 가로채지 않음", () => {
    expect(isTypingTarget(element("DIV", true))).toBe(true);
  });

  it("일반 요소나 대상이 없으면 단축키 처리", () => {
    expect(isTypingTarget(element("BUTTON"))).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });
});
