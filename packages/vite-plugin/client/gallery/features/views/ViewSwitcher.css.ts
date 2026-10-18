import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";
import { fieldBorder } from "../../shared/ui/field.css";

export const root = style({
  display: "inline-flex",
  padding: 2,
  border: fieldBorder,
  borderRadius: vars.radius.md,
  background: vars.color.surfaceSubtle,
});

export const option = style({
  padding: `0.2rem ${vars.space.md}`,
  border: "none",
  borderRadius: vars.radius.sm,
  background: "transparent",
  color: vars.color.textMuted,
  fontFamily: "inherit",
  fontSize: vars.fontSize.label,
  cursor: "pointer",
  selectors: {
    "&:hover": { color: vars.color.text },
    '&[aria-pressed="true"]': {
      background: vars.color.surface,
      color: vars.color.text,
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.12)",
    },
  },
});
