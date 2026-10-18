import { style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

export const wall = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "2.5rem",
  margin: "3.5rem 0 0",
  padding: 0,
  listStyle: "none",
});

export const step = style({
  paddingTop: "1.5rem",
  borderTop: `1px solid ${vars.color.border}`,
});

export const text = style({
  margin: "1rem 0 0",
  color: vars.color.textMuted,
});
