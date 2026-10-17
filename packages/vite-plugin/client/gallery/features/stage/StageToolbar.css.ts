import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";

export const root = style({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: `${vars.space.sm} 0.9rem`,
  marginLeft: "auto",
});
