export type StageBackground = "light" | "dark" | "transparent";

export const STAGE_BACKGROUNDS: readonly StageBackground[] = ["light", "dark", "transparent"];

export const BACKGROUND_LABEL: Record<StageBackground, string> = {
  light: "Light background",
  dark: "Dark background",
  transparent: "Transparent background",
};

export function toStageBackground(value: unknown): StageBackground {
  return STAGE_BACKGROUNDS.find((option) => option === value) ?? "light";
}
