import { style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

export const hero = style({
  paddingBlock: "clamp(3rem, 8vw, 5rem) clamp(3rem, 8vw, 5rem)",
});

export const intro = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.375rem",
  textAlign: "center",
});

export const label = style({
  margin: 0,
  padding: "0.375rem 0.75rem",
  borderRadius: "999px",
  background: vars.color.accentSoft,
  color: vars.color.accent,
  fontSize: "0.8125rem",
  fontWeight: 600,
});

export const title = style({
  margin: 0,
  fontSize: "clamp(2.75rem, 8vw, 5.25rem)",
  fontWeight: 650,
  lineHeight: 1.02,
  letterSpacing: "-0.045em",
});

export const titleAccent = style({
  display: "block",
  color: vars.color.accent,
});

export const lead = style({
  margin: 0,
  maxWidth: "38rem",
  color: vars.color.textMuted,
  fontSize: "clamp(1.0625rem, 2vw, 1.1875rem)",
  lineHeight: 1.6,
});

export const leadCode = style({
  padding: "0.1em 0.35em",
  borderRadius: vars.radius.small,
  background: vars.color.accentSoft,
  color: vars.color.accent,
  fontSize: "0.9em",
  whiteSpace: "nowrap",
});

export const actions = style({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "0.75rem",
});

export const demoLink = style({
  display: "inline-flex",
  alignItems: "center",
  height: "48px",
  paddingInline: "1.375rem",
  borderRadius: "999px",
  background: vars.color.text,
  color: vars.color.background,
  fontWeight: 600,
  textDecoration: "none",
  selectors: {
    "&:hover": { background: vars.color.accent, color: vars.color.onAccent },
  },
});

export const demo = style({
  marginTop: "clamp(2.5rem, 6vw, 3.5rem)",
});

export const hint = style({
  margin: "0.875rem 0 0",
  color: vars.color.textMuted,
  fontSize: "0.875rem",
  textAlign: "right",
});
