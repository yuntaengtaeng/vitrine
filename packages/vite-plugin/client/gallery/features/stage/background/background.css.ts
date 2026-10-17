import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../shared/theme/theme.css";
import { fieldBorder } from "../../../shared/ui/field.css";
import type { StageBackground } from "./background";

const checkerboard = (cell: number) =>
  `repeating-conic-gradient(${vars.color.checkerDark} 0 25%, ${vars.color.checkerLight} 0 50%) 0 0 / ${cell}px ${cell}px`;

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
  light: vars.color.surface,
  dark: vars.color.frameDark,
  transparent: checkerboard(8),
};

export const swatch = styleVariants(swatchBackground, (background) => [swatchBase, { background }]);

export const frame = styleVariants({
  light: { background: vars.color.surface, outlineColor: vars.color.frameBorder },
  dark: { background: vars.color.frameDark, outlineColor: vars.color.frameDarkBorder },
  transparent: { background: checkerboard(14), outlineColor: vars.color.frameBorder },
});
