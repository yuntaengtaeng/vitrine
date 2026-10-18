import { describe, expect, it } from "vitest";
import { DEFAULT_PANEL_SIZE, MIN_PANEL_HEIGHT, MIN_STAGE_HEIGHT, clampPanelHeight, parsePanelSize } from "./panelSize";

describe("clampPanelHeight", () => {
  it("무대 최소 높이를 남기도록 줄임", () => {
    expect(clampPanelHeight(900, 600)).toBe(600 - MIN_STAGE_HEIGHT);
  });

  it("패널 최소 높이 아래로는 줄이지 않고, 공간이 모자라도 최소 높이 유지", () => {
    expect(clampPanelHeight(40, 600)).toBe(MIN_PANEL_HEIGHT);
    expect(clampPanelHeight(300, 200)).toBe(MIN_PANEL_HEIGHT);
  });

  it("범위 안의 값은 정수로만 맞춤", () => {
    expect(clampPanelHeight(250.6, 800)).toBe(251);
  });
});

describe("parsePanelSize", () => {
  it("저장된 값이 없거나 JSON이 깨졌으면 기본값", () => {
    expect(parsePanelSize(null)).toEqual(DEFAULT_PANEL_SIZE);
    expect(parsePanelSize("{oops")).toEqual(DEFAULT_PANEL_SIZE);
  });

  it("저장된 높이와 접힘 상태 복원", () => {
    expect(parsePanelSize('{"height":340,"collapsed":true}')).toEqual({ height: 340, collapsed: true });
  });

  it("잘못된 높이는 기본값, 너무 작은 높이는 최소 높이", () => {
    expect(parsePanelSize('{"height":"tall"}')).toEqual(DEFAULT_PANEL_SIZE);
    expect(parsePanelSize('{"height":10}').height).toBe(MIN_PANEL_HEIGHT);
  });
});
