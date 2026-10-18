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

export const floatingHeader = style({
  position: "sticky",
  top: 0,
  zIndex: 10,
  display: "flex",
  justifyContent: "center",
  paddingTop: "16px",
  paddingInline: vars.layout.gutter,
  pointerEvents: "none",
});

export const pill = style({
  pointerEvents: "auto",
  display: "flex",
  alignItems: "center",
  gap: "1.25rem",
  padding: "6px 6px 6px 16px",
  border: "1px solid transparent",
  borderRadius: "999px",
  fontSize: "0.9375rem",
  transition: "background 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
  selectors: {
    '&[data-scrolled="true"]': {
      borderColor: vars.color.border,
      background: `color-mix(in srgb, ${vars.color.background} 82%, transparent)`,
      backdropFilter: "blur(12px)",
      boxShadow: "0 10px 30px -18px rgba(8, 11, 28, 0.35)",
    },
  },
  "@media": {
    "(max-width: 720px)": { gap: "0.75rem", width: "100%", justifyContent: "space-between" },
    "(prefers-reduced-motion: reduce)": { transition: "none" },
  },
});

export const brand = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.625rem",
  fontSize: "1.125rem",
  fontWeight: 650,
  letterSpacing: "-0.01em",
  textDecoration: "none",
  whiteSpace: "nowrap",
});

export const logo = style({
  width: 28,
  height: 28,
});

export const nav = style({
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
  flexShrink: 0,
  fontSize: "0.9375rem",
  "@media": { "(max-width: 720px)": { gap: "0.75rem" } },
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

export const iconLink = style({
  display: "inline-grid",
  placeItems: "center",
  width: "32px",
  height: "32px",
  color: vars.color.textMuted,
  selectors: {
    "&:hover": { color: vars.color.text },
  },
  "@media": { "(max-width: 420px)": { display: "none" } },
});

export const language = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.375rem",
  minHeight: "32px",
  paddingInline: "0.625rem",
  border: `1px solid ${vars.color.border}`,
  borderRadius: "999px",
  color: vars.color.text,
  fontSize: "0.8125rem",
  textDecoration: "none",
  whiteSpace: "nowrap",
  selectors: {
    "&:hover": { borderColor: vars.color.accent },
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
  whiteSpace: "nowrap",
  selectors: {
    "&:hover": { background: vars.color.accentStrong },
  },
});
