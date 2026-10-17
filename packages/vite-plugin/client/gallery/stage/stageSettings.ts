import { toStageBackground, type StageBackground } from "./background/background";
import { RESPONSIVE_VIEWPORT } from "./viewport/viewport";

/** 프리뷰를 바꿔도 유지되는 무대 표시 설정 */
export interface StageSettings {
  background: StageBackground;
  /** 선택한 viewport 이름, 목록에서 사라졌으면 화면에서는 Responsive로 다룸 */
  viewport: string;
}

export const DEFAULT_STAGE_SETTINGS: StageSettings = { background: "light", viewport: RESPONSIVE_VIEWPORT };

/** 저장소에서 읽은 값을 무대 설정으로 복원, 모르는 값은 그 항목만 기본값 */
export function parseStageSettings(raw: string | null): StageSettings {
  if (!raw) return DEFAULT_STAGE_SETTINGS;
  try {
    const value = JSON.parse(raw) as Partial<Record<keyof StageSettings, unknown>>;
    return {
      background: toStageBackground(value.background),
      viewport: typeof value.viewport === "string" && value.viewport ? value.viewport : DEFAULT_STAGE_SETTINGS.viewport,
    };
  } catch {
    return DEFAULT_STAGE_SETTINGS;
  }
}
