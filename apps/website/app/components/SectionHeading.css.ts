import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const label = style({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  margin: 0,
  color: vars.color.accent,
  fontFamily: vars.font.mono,
  fontSize: "0.75rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  selectors: {
    "&::before": { content: '""', width: "2rem", height: "1px", background: "currentColor" },
  },
});

export const title = style({
  margin: "1rem 0 0",
  maxWidth: "18ch",
  fontFamily: vars.font.display,
  fontSize: "clamp(2.5rem, 6vw, 4.25rem)",
  fontWeight: 400,
  lineHeight: 1.02,
  letterSpacing: "-0.015em",
  textWrap: "balance",
});

export const lead = style({
  margin: "1.25rem 0 0",
  maxWidth: "58ch",
  color: "inherit",
  opacity: 0.78,
  fontSize: "1.125rem",
});
