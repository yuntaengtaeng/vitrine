import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const footer = style({
  borderTop: `1px solid ${vars.color.border}`,
  paddingBlock: "3rem",
  color: vars.color.textMuted,
  fontSize: "0.9375rem",
});

export const inner = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1.5rem",
});

export const links = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "1.5rem",
});

export const link = style({
  textDecoration: "none",
  selectors: {
    "&:hover": { color: vars.color.text },
  },
});
