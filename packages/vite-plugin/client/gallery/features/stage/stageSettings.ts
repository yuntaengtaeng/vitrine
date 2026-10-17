import { toStageBackground, type StageBackground } from "./background/background";
import { RESPONSIVE_VIEWPORT } from "./viewport/viewport";

export interface StageSettings {
  background: StageBackground;
  viewport: string;
}

export const DEFAULT_STAGE_SETTINGS: StageSettings = { background: "light", viewport: RESPONSIVE_VIEWPORT };

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
