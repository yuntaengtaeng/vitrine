import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const header = style({
  position: "sticky",
  top: 0,
  zIndex: 10,
  borderBottom: `1px solid ${vars.color.border}`,
  background: vars.color.background,
});

export const inner = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1.5rem",
  height: "64px",
});

export const brand = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.625rem",
  fontSize: "1.125rem",
  fontWeight: 650,
  letterSpacing: "-0.01em",
  textDecoration: "none",
});

export const logo = style({
  width: 28,
  height: 28,
});

export const nav = style({
  display: "flex",
  alignItems: "center",
  gap: "1.75rem",
  flexShrink: 0,
  fontSize: "0.9375rem",
});

export const navLink = style({
  color: vars.color.textMuted,
  textDecoration: "none",
  selectors: {
    "&:hover": { color: vars.color.text },
  },
  "@media": {
    "(max-width: 720px)": { display: "none" },
  },
});

export const language = style({
  color: vars.color.textMuted,
  fontSize: "0.875rem",
  textDecoration: "none",
  selectors: {
    "&:hover": { color: vars.color.text },
  },
});

export const cta = style({
  display: "inline-flex",
  alignItems: "center",
  height: "36px",
  paddingInline: "1rem",
  borderRadius: "999px",
  background: vars.color.accent,
  color: vars.color.onAccent,
  fontWeight: 600,
  textDecoration: "none",
  selectors: {
    "&:hover": { background: vars.color.accentStrong },
  },
});
