import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";

export const groupToggle = style({
  display: "flex",
  alignItems: "center",
  gap: 6,
  width: "100%",
  padding: "0.55rem 0.7rem 0.25rem",
  border: "none",
  background: "transparent",
  color: vars.color.textMuted,
  fontFamily: "inherit",
  fontSize: vars.fontSize.label,
  fontWeight: 700,
  letterSpacing: "0.03em",
  textAlign: "left",
  cursor: "pointer",
  ":hover": { color: vars.color.text },
});

export const chevron = style({
  transition: "transform 120ms ease",
  selectors: { [`${groupToggle}[aria-expanded="false"] &`]: { transform: "rotate(-90deg)" } },
});

export const count = style({ marginLeft: "auto", fontWeight: 500, fontVariantNumeric: "tabular-nums" });

export const groupChildren = style({ marginLeft: vars.space.sm });
