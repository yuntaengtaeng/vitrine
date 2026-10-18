import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const container = style({
  width: "100%",
  maxWidth: vars.layout.maxWidth,
  marginInline: "auto",
  paddingInline: vars.layout.gutter,
});

export const section = style({
  paddingBlock: "clamp(4rem, 10vw, 7.5rem)",
});

/** 배경을 한 톤 올려 앞뒤 섹션과 구분하는 섹션 */
export const surfaceSection = style([section, { background: vars.color.surface }]);
