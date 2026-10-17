import { describe, expect, it } from "vitest";
import { focusableRadioIndex, nextRadioIndex } from "./radioKeyboard";

describe("nextRadioIndex", () => {
  it("오른쪽과 아래 방향키는 다음 항목으로 이동", () => {
    expect(nextRadioIndex(0, "ArrowRight", 3)).toBe(1);
    expect(nextRadioIndex(1, "ArrowDown", 3)).toBe(2);
  });

  it("왼쪽과 위 방향키는 이전 항목으로 이동", () => {
    expect(nextRadioIndex(2, "ArrowLeft", 3)).toBe(1);
    expect(nextRadioIndex(1, "ArrowUp", 3)).toBe(0);
  });

  it("양 끝에서는 반대쪽 끝으로 순환", () => {
    expect(nextRadioIndex(2, "ArrowRight", 3)).toBe(0);
    expect(nextRadioIndex(0, "ArrowLeft", 3)).toBe(2);
  });

  it("선택값이 없을 때 첫 이동은 양 끝 항목 선택", () => {
    expect(nextRadioIndex(focusableRadioIndex(-1), "ArrowRight", 3)).toBe(1);
    expect(nextRadioIndex(focusableRadioIndex(-1), "ArrowLeft", 3)).toBe(2);
  });

  it("방향키가 아니거나 항목이 없으면 이동하지 않음", () => {
    expect(nextRadioIndex(0, "Enter", 3)).toBeNull();
    expect(nextRadioIndex(0, "ArrowRight", 0)).toBeNull();
  });
});

describe("focusableRadioIndex", () => {
  it("선택된 항목을 Tab 진입 지점으로 사용", () => {
    expect(focusableRadioIndex(2)).toBe(2);
  });

  it("선택값이 없으면 첫 항목을 Tab 진입 지점으로 사용", () => {
    expect(focusableRadioIndex(-1)).toBe(0);
  });
});
