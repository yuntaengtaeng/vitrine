import { style } from "@vanilla-extract/css";
import { vars } from "../theme/theme.css";

export const FIELD_HEIGHT = "32px";

export const fieldBorder = `1px solid ${vars.color.border}`;

export const field = style({
  width: "100%",
  height: FIELD_HEIGHT,
  padding: `0 ${vars.space.sm}`,
  border: fieldBorder,
  borderRadius: vars.radius.md,
  background: vars.color.surface,
  color: vars.color.text,
  fontFamily: "inherit",
  fontSize: vars.fontSize.secondary,
  outlineColor: vars.color.accent,
});
