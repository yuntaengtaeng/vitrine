export interface PanelSize {
  /** 탭 줄을 포함한 px, 내용과 무관하게 유지 */
  height: number;
  collapsed: boolean;
}

export const DEFAULT_PANEL_SIZE: PanelSize = { height: 280, collapsed: false };

export const MIN_PANEL_HEIGHT = 120;

/** 패널을 아무리 키워도 무대에 남기는 px */
export const MIN_STAGE_HEIGHT = 160;

export const PANEL_RESIZE_STEP = 16;

/**
 * 무대와 패널이 나눠 쓰는 높이 안에서 패널 높이 제한
 * @param height 원하는 패널 높이 px
 * @param available 무대와 패널을 합친 높이 px
 */
export function clampPanelHeight(height: number, available: number): number {
  return Math.round(Math.max(MIN_PANEL_HEIGHT, Math.min(height, available - MIN_STAGE_HEIGHT)));
}

export function parsePanelSize(raw: string | null): PanelSize {
  if (!raw) return DEFAULT_PANEL_SIZE;
  try {
    const value = JSON.parse(raw) as Partial<Record<keyof PanelSize, unknown>>;
    return {
      height:
        typeof value.height === "number" && Number.isFinite(value.height)
          ? Math.max(MIN_PANEL_HEIGHT, Math.round(value.height))
          : DEFAULT_PANEL_SIZE.height,
      collapsed: value.collapsed === true,
    };
  } catch {
    return DEFAULT_PANEL_SIZE;
  }
}
