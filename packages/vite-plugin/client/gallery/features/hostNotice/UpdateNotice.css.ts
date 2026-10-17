import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";

export const root = style({
  margin: 0,
  padding: `${vars.space.xs} ${vars.space.lg}`,
  borderBottom: `1px solid ${vars.color.border}`,
  background: vars.color.accentSoft,
  color: vars.color.text,
  fontSize: vars.fontSize.label,
});
