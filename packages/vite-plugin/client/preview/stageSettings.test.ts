import { describe, expect, it } from "vitest";
import { DEFAULT_STAGE_SETTINGS, frameCssWidth, parseStageSettings, stageWidthLabel } from "./stageSettings";

describe("parseStageSettings", () => {
  it("저장된 값이 없으면 기본값", () => {
    expect(parseStageSettings(null)).toEqual(DEFAULT_STAGE_SETTINGS);
  });

  it("저장된 배경과 너비 복원", () => {
    expect(parseStageSettings('{"background":"dark","width":375}')).toEqual({ background: "dark", width: 375 });
  });

  it("모르는 값은 그 항목만 기본값으로 대체", () => {
    expect(parseStageSettings('{"background":"neon","width":"full"}')).toEqual({ background: "light", width: "full" });
    expect(parseStageSettings('{"background":"transparent","width":1024}')).toEqual({
      background: "transparent",
      width: "fit",
    });
  });

  it("JSON이 깨졌으면 기본값", () => {
    expect(parseStageSettings("{oops")).toEqual(DEFAULT_STAGE_SETTINGS);
  });
});

describe("frameCssWidth", () => {
  it("프리셋을 프레임 CSS width로 변환", () => {
    expect(frameCssWidth("fit")).toBe("auto");
    expect(frameCssWidth(375)).toBe("375px");
    expect(frameCssWidth("full")).toBe("100%");
  });
});

describe("stageWidthLabel", () => {
  it("프리셋 표시 이름", () => {
    expect(stageWidthLabel("fit")).toBe("Fit");
    expect(stageWidthLabel(768)).toBe("768px");
    expect(stageWidthLabel("full")).toBe("Full");
  });
});
