import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const placard = style({
  display: "grid",
  gap: "0.125rem",
  margin: 0,
  paddingLeft: "0.875rem",
  borderLeft: `2px solid ${vars.color.accent}`,
});

export const number = style({
  color: vars.color.accent,
  fontFamily: vars.font.mono,
  fontSize: "0.75rem",
  letterSpacing: "0.04em",
});

export const title = style({
  fontSize: "1.125rem",
  fontWeight: 650,
  letterSpacing: "-0.01em",
  lineHeight: 1.3,
});

export const medium = style({
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
  fontSize: "0.8125rem",
});
