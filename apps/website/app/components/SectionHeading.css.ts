import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const label = style({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  margin: 0,
  color: vars.color.accent,
  fontSize: "0.9375rem",
  fontWeight: 600,
  selectors: {
    "&::after": {
      content: "",
      width: "2.5rem",
      height: "1px",
      background: vars.color.accent,
    },
  },
});

export const title = style({
  margin: "0.875rem 0 0",
  maxWidth: "20ch",
  fontSize: "clamp(2rem, 4.5vw, 3rem)",
  fontWeight: 700,
  lineHeight: 1.15,
  letterSpacing: "-0.035em",
  textWrap: "balance",
});

export const lead = style({
  margin: "1.25rem 0 0",
  maxWidth: "58ch",
  color: vars.color.textMuted,
  fontSize: "1.125rem",
});
