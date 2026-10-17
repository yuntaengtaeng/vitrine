import { toStageBackground, type StageBackground } from "./background/background";
import { RESPONSIVE_VIEWPORT } from "./viewport/viewport";

export interface StageSettings {
  background: StageBackground;
  viewport: string;
  view: string;
}

export const DEFAULT_STAGE_SETTINGS: StageSettings = { background: "light", viewport: RESPONSIVE_VIEWPORT, view: "single" };

export function parseStageSettings(raw: string | null): StageSettings {
  if (!raw) return DEFAULT_STAGE_SETTINGS;
  try {
    const value = JSON.parse(raw) as Partial<Record<keyof StageSettings, unknown>>;
    return {
      background: toStageBackground(value.background),
      viewport: typeof value.viewport === "string" && value.viewport ? value.viewport : DEFAULT_STAGE_SETTINGS.viewport,
      view: typeof value.view === "string" && value.view ? value.view : DEFAULT_STAGE_SETTINGS.view,
    };
  } catch {
    return DEFAULT_STAGE_SETTINGS;
  }
}
