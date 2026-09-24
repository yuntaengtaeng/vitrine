import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

// 가로 스크롤 영역을 만들지 않도록 긴 줄은 감쌈
export const snippet = style({
  margin: 0,
  padding: "0.875rem 1rem",
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.small,
  background: vars.color.surface,
  color: vars.color.text,
  fontFamily: vars.font.mono,
  fontSize: "0.8125rem",
  lineHeight: 1.7,
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
});

export const comment = style({
  color: vars.color.accent,
});
