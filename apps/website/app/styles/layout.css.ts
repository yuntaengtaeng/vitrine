import { globalStyle, style } from "@vanilla-extract/css";
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

// 배경이 같은 섹션끼리는 두 패딩이 한 면으로 이어져 경계보다 넓어 보이므로 뒤 섹션 윗간격을 줄임
globalStyle(
  `${section}:not(${surfaceSection}) + ${section}:not(${surfaceSection}), ${surfaceSection} + ${surfaceSection}`,
  { paddingTop: "clamp(2rem, 5vw, 4rem)" },
);
