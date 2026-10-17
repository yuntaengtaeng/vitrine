/** 무대 프레임 배경 */
export type StageBackground = "light" | "dark" | "transparent";

/** 무대 프레임 너비 프리셋, 숫자는 px */
export type StageWidth = "fit" | 375 | 768 | "full";

/** 프리뷰를 바꿔도 유지되는 무대 표시 설정 */
export interface StageSettings {
  background: StageBackground;
  width: StageWidth;
}

export const STAGE_BACKGROUNDS: readonly StageBackground[] = ["light", "dark", "transparent"];
export const STAGE_WIDTHS: readonly StageWidth[] = ["fit", 375, 768, "full"];
export const DEFAULT_STAGE_SETTINGS: StageSettings = { background: "light", width: "fit" };

/** 저장소에서 읽은 값을 무대 설정으로 복원, 모르는 값은 기본값으로 대체 */
export function parseStageSettings(raw: string | null): StageSettings {
  if (!raw) return DEFAULT_STAGE_SETTINGS;
  try {
    const value = JSON.parse(raw) as Partial<Record<keyof StageSettings, unknown>>;
    return {
      background: STAGE_BACKGROUNDS.find((option) => option === value.background) ?? DEFAULT_STAGE_SETTINGS.background,
      width: STAGE_WIDTHS.find((option) => option === value.width) ?? DEFAULT_STAGE_SETTINGS.width,
    };
  } catch {
    return DEFAULT_STAGE_SETTINGS;
  }
}

/** 너비 프리셋의 프레임 CSS width */
export function frameCssWidth(width: StageWidth): string {
  if (width === "fit") return "auto";
  if (width === "full") return "100%";
  return `${width}px`;
}

/** 너비 프리셋의 표시 이름 */
export function stageWidthLabel(width: StageWidth): string {
  if (width === "fit") return "Fit";
  if (width === "full") return "Full";
  return `${width}px`;
}
