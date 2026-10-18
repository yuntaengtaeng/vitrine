import { style, styleVariants } from "@vanilla-extract/css";
import { INK, NEUTRAL } from "@vitrine/brand";
import { vars } from "../../../shared/theme/theme.css";
import { fieldBorder } from "../../../shared/ui/field.css";
import type { StageBackground } from "./background";

// 프리뷰 뒤 배경은 사용자 컴포넌트를 비춰 보는 값이라 Gallery 테마를 따르지 않고 고정
const LIGHT = NEUTRAL[0];
const DARK = INK[900];

const checkerboard = (cell: number) =>
  `repeating-conic-gradient(${NEUTRAL[200]} 0 25%, ${NEUTRAL[0]} 0 50%) 0 0 / ${cell}px ${cell}px`;

export const picker = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  color: vars.color.textMuted,
  fontSize: vars.fontSize.label,
});

export const swatches = style({ display: "inline-flex", gap: vars.space.xs });

const swatchBase = style({
  width: 20,
  height: 20,
  padding: 0,
  border: fieldBorder,
  borderRadius: 5,
  cursor: "pointer",
  selectors: { '&[aria-pressed="true"]': { outline: `2px solid ${vars.color.accent}`, outlineOffset: 1 } },
});

const swatchBackground: Record<StageBackground, string> = {
  light: LIGHT,
  dark: DARK,
  transparent: checkerboard(8),
};

export const swatch = styleVariants(swatchBackground, (background) => [swatchBase, { background }]);

export const frame = styleVariants({
  light: { background: LIGHT, outlineColor: vars.color.frameBorder },
  dark: { background: DARK, outlineColor: vars.color.frameBorder },
  transparent: { background: checkerboard(14), outlineColor: vars.color.frameBorder },
});
