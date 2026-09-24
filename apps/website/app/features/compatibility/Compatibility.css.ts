import { style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

export const statement = style({
  margin: "1.5rem 0 0",
  maxWidth: "46ch",
  color: vars.color.text,
  fontSize: "clamp(1.25rem, 2.4vw, 1.625rem)",
  lineHeight: 1.45,
  letterSpacing: "-0.01em",
});
