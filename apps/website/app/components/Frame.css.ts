import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const frame = style({
  padding: "clamp(0.5rem, 1.6vw, 0.875rem)",
  border: `1px solid ${vars.color.border}`,
  background: vars.color.frame,
  boxShadow: "0 1px 0 rgba(8, 11, 28, 0.04), 0 18px 40px -24px rgba(8, 11, 28, 0.35)",
});

export const image = style({
  display: "block",
  width: "100%",
  height: "auto",
  border: `1px solid ${vars.color.border}`,
});
