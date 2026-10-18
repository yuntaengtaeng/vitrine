import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";

export const root = style({
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  color: vars.color.textMuted,
  fontSize: vars.fontSize.label,
  pointerEvents: "none",
});
