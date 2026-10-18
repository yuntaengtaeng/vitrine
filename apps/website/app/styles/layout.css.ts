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

/** 조명을 낮춘 전시실처럼 어두운 섹션, 라이트 모드에서도 어둡게 유지 */
export const roomSection = style([
  section,
  {
    background: `radial-gradient(ellipse 70% 60% at 50% 0%, rgba(94, 117, 222, 0.22), transparent 70%), ${vars.color.room}`,
    color: vars.color.roomText,
  },
]);
