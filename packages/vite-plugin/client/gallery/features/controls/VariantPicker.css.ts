import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";

export const root = style({ display: "flex", gap: "0.4rem", flexWrap: "wrap" });

export const tab = style({
  padding: "0.3rem 0.1rem",
  border: "none",
  borderBottom: "2px solid transparent",
  background: "transparent",
  color: vars.color.textMuted,
  fontFamily: "inherit",
  fontSize: vars.fontSize.label,
  cursor: "pointer",
  selectors: {
    "&:hover": { color: vars.color.text },
    '&[aria-pressed="true"]': { borderBottomColor: vars.color.accent, color: vars.color.accent },
  },
});
