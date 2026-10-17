import type { CSSProperties } from "react";
import { COLOR } from "../../../tokens/color";
import { checkerboard } from "../../../tokens/pattern";

/** 무대 프레임 배경 */
export type StageBackground = "light" | "dark" | "transparent";

export const STAGE_BACKGROUNDS: readonly StageBackground[] = ["light", "dark", "transparent"];

/** 배경별 이름, toolbar 견본, 무대 프레임 스타일 */
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

/** 저장된 값이 배경이면 그대로, 아니면 기본 배경 */
export function toStageBackground(value: unknown): StageBackground {
  return STAGE_BACKGROUNDS.find((option) => option === value) ?? "light";
}
