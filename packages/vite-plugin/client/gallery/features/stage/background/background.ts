import type { CSSProperties } from "react";
import { COLOR } from "../../../../tokens/color";
import { checkerboard } from "../../../../tokens/pattern";

export type StageBackground = "light" | "dark" | "transparent";

export const STAGE_BACKGROUNDS: readonly StageBackground[] = ["light", "dark", "transparent"];

export const BACKGROUND_STYLE: Record<StageBackground, { label: string; swatch: string; frame: CSSProperties }> = {
  light: {
    label: "Light background",
    swatch: COLOR.surface,
    frame: { background: COLOR.surface, outlineColor: COLOR.frameBorder },
  },
  dark: {
    label: "Dark background",
    swatch: COLOR.frameDarkBg,
    frame: { background: COLOR.frameDarkBg, outlineColor: COLOR.frameDarkBorder },
  },
  transparent: {
    label: "Transparent background",
    swatch: checkerboard(8),
    frame: { background: checkerboard(14), outlineColor: COLOR.frameBorder },
  },
};

export function toStageBackground(value: unknown): StageBackground {
  return STAGE_BACKGROUNDS.find((option) => option === value) ?? "light";
}
