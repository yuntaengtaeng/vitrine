import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";

export const item = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  width: "100%",
  marginBottom: 2,
  padding: "0.55rem 0.7rem",
  border: "none",
  borderRadius: vars.radius.md,
  background: "transparent",
  color: vars.color.text,
  fontFamily: "inherit",
  fontSize: vars.fontSize.base,
  textAlign: "left",
  cursor: "pointer",
  selectors: {
    "&:hover": { background: vars.color.surface },
    '&[aria-current="true"]': { background: vars.color.sidebarActive, color: vars.color.accent, fontWeight: 600 },
  },
});

export const failedDot = style({
  width: 7,
  height: 7,
  marginLeft: "auto",
  flexShrink: 0,
  borderRadius: "50%",
  background: vars.color.error,
});
