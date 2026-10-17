import { style } from "@vanilla-extract/css";
import { vars } from "../../../shared/theme/theme.css";
import { field } from "../../../shared/ui/field.css";

export const picker = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  color: vars.color.textMuted,
  fontSize: vars.fontSize.label,
});

export const select = style([field, { width: "auto", height: 26, padding: "0 0.4rem", fontSize: vars.fontSize.label }]);
