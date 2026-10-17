import { style } from "@vanilla-extract/css";
import { vars } from "../theme/theme.css";
import { fieldBorder } from "./field.css";

export const secondaryButton = style({
  flexShrink: 0,
  padding: `0.3rem ${vars.space.md}`,
  border: fieldBorder,
  borderRadius: vars.radius.md,
  background: vars.color.surface,
  color: vars.color.text,
  fontFamily: "inherit",
  fontSize: vars.fontSize.label,
  cursor: "pointer",
  ":hover": { background: vars.color.hover },
});

export const iconButton = style({
  display: "grid",
  placeItems: "center",
  padding: 0,
  border: "none",
  borderRadius: vars.radius.md,
  background: "transparent",
  color: vars.color.textMuted,
  cursor: "pointer",
  ":hover": { background: vars.color.hover, color: vars.color.text },
});
