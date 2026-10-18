import { style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

export const section = style({
  paddingBlock: "clamp(2rem, 6vw, 4rem) clamp(4rem, 10vw, 6rem)",
});

export const panel = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1.5rem",
  padding: "clamp(1.75rem, 5vw, 2.75rem)",
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.large,
  background: vars.color.surface,
});

export const copy = style({ display: "flex", flexDirection: "column", gap: "0.5rem" });

export const title = style({
  margin: 0,
  fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
  fontWeight: 650,
  letterSpacing: "-0.03em",
});

export const text = style({ margin: 0, color: vars.color.textMuted });

export const actions = style({ display: "flex", flexWrap: "wrap", gap: "0.75rem" });

const button = style({
  display: "inline-flex",
  alignItems: "center",
  height: "48px",
  paddingInline: "1.375rem",
  borderRadius: "999px",
  fontWeight: 600,
  textDecoration: "none",
});

export const primary = style([
  button,
  {
    background: vars.color.text,
    color: vars.color.background,
    selectors: { "&:hover": { opacity: 0.86 } },
  },
]);

export const secondary = style([
  button,
  {
    border: `1px solid ${vars.color.border}`,
    color: vars.color.text,
    selectors: { "&:hover": { borderColor: vars.color.text } },
  },
]);
