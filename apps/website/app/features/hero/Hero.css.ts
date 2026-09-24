import { style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

export const hero = style({
  paddingBlock: "clamp(3rem, 8vw, 5.5rem) clamp(3rem, 8vw, 5rem)",
});

export const intro = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
  alignItems: "end",
  gap: "2.5rem",
  "@media": {
    "(max-width: 860px)": { gridTemplateColumns: "minmax(0, 1fr)" },
  },
});

export const label = style({
  margin: 0,
  color: vars.color.textMuted,
  fontSize: "0.9375rem",
});

export const title = style({
  margin: "0.75rem 0 0",
  fontSize: "clamp(3rem, 8vw, 5.75rem)",
  fontWeight: 650,
  lineHeight: 1,
  letterSpacing: "-0.04em",
});

export const titleAccent = style({
  display: "block",
  color: vars.color.accent,
});

export const lead = style({
  margin: 0,
  color: vars.color.textMuted,
  fontSize: "1.125rem",
});

export const actions = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
  marginTop: "1.5rem",
});

export const extension = style({
  display: "inline-flex",
  alignItems: "center",
  height: "48px",
  paddingInline: "1.25rem",
  borderRadius: vars.radius.medium,
  background: vars.color.accent,
  color: vars.color.onAccent,
  fontWeight: 600,
  textDecoration: "none",
  selectors: {
    "&:hover": { background: vars.color.accentStrong },
  },
});

export const demo = style({
  marginTop: "clamp(2.5rem, 6vw, 4rem)",
});

export const hint = style({
  margin: "0.875rem 0 0",
  color: vars.color.textMuted,
  fontSize: "0.875rem",
  textAlign: "right",
});
