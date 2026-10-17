import { describe, expect, it } from "vitest";
import { DEFAULT_STAGE_SETTINGS, parseStageSettings } from "./stageSettings";
import { findViewport, viewportLabel } from "./viewport/viewport";

describe("parseStageSettings", () => {
  it("저장된 값이 없거나 JSON이 깨졌으면 기본값", () => {
    expect(parseStageSettings(null)).toEqual(DEFAULT_STAGE_SETTINGS);
    expect(parseStageSettings("{oops")).toEqual(DEFAULT_STAGE_SETTINGS);
  });

  it("저장된 배경과 viewport 이름 복원", () => {
    expect(parseStageSettings('{"background":"dark","viewport":"Mobile"}')).toEqual({ background: "dark", viewport: "Mobile" });
  });

  it("모르는 배경과 이전 버전의 너비 설정은 기본값으로 대체", () => {
    expect(parseStageSettings('{"background":"neon","width":"fit"}')).toEqual(DEFAULT_STAGE_SETTINGS);
  });
});

describe("findViewport", () => {
  const viewports = [{ name: "Mobile", width: 375 }];

  it("이름으로 고정 너비 viewport 조회", () => {
    expect(findViewport("Mobile", viewports)).toEqual({ name: "Mobile", width: 375 });
  });

  it("Responsive이거나 목록에서 사라진 이름은 null", () => {
    expect(findViewport("Responsive", viewports)).toBeNull();
    expect(findViewport("Tablet", viewports)).toBeNull();
  });

  it("선택 목록 이름에 너비 표시", () => {
    expect(viewportLabel({ name: "Mobile", width: 375 })).toBe("Mobile 375px");
  });
});
