import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const placard = style({
  display: "grid",
  gap: "0.2rem",
  margin: 0,
  paddingLeft: "0.875rem",
  borderLeft: `2px solid ${vars.color.accent}`,
});

export const number = style({
  color: vars.color.accent,
  fontFamily: vars.font.mono,
  fontSize: "0.75rem",
  letterSpacing: "0.08em",
});

export const title = style({
  fontFamily: vars.font.display,
  fontSize: "1.625rem",
  fontWeight: 400,
  lineHeight: 1.1,
});

// 작품 라벨의 재료 표기처럼 기울여 씀
export const medium = style({
  color: "inherit",
  opacity: 0.7,
  fontFamily: vars.font.mono,
  fontSize: "0.8125rem",
  fontStyle: "italic",
});
