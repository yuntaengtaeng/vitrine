import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const button = style({
  display: "inline-flex",
  maxWidth: "100%",
  alignItems: "center",
  gap: "0.875rem",
  height: "48px",
  paddingInline: "1.125rem",
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.medium,
  background: vars.color.surfaceRaised,
  color: vars.color.text,
  fontFamily: vars.font.mono,
  fontSize: "0.9375rem",
  cursor: "pointer",
  selectors: {
    "&:hover": { borderColor: vars.color.accent },
  },
  "@media": {
    "(max-width: 520px)": {
      display: "grid",
      gridTemplateColumns: "auto minmax(0, 1fr)",
      width: "100%",
      height: "auto",
      minHeight: "48px",
      paddingBlock: "0.75rem",
      textAlign: "left",
    },
  },
});

export const command = style({
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  "@media": {
    "(max-width: 520px)": {
      overflow: "visible",
      textOverflow: "clip",
      whiteSpace: "normal",
      overflowWrap: "anywhere",
    },
  },
});

export const prompt = style({
  color: vars.color.accent,
  userSelect: "none",
});

export const status = style({
  minWidth: "4.5em",
  color: vars.color.textMuted,
  fontFamily: vars.font.body,
  fontSize: "0.8125rem",
  textAlign: "right",
  "@media": {
    "(max-width: 520px)": {
      gridColumn: 2,
      minWidth: 0,
      textAlign: "left",
    },
  },
});
