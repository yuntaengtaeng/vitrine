import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";

export const root = style({
  display: "flex",
  flexDirection: "column",
  maxHeight: 300,
  flexShrink: 0,
  borderTop: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
});

export const bar = style({
  display: "flex",
  alignItems: "center",
  minHeight: 40,
  padding: `0 ${vars.space.lg}`,
  borderBottom: `1px solid ${vars.color.border}`,
});

export const tabs = style({ display: "flex", gap: vars.space.lg, alignSelf: "stretch" });

export const actions = style({ display: "flex", alignItems: "center", gap: vars.space.sm, marginLeft: "auto" });

export const tab = style({
  padding: `0.55rem 0.1rem`,
  border: "none",
  borderBottom: "2px solid transparent",
  background: "transparent",
  color: vars.color.textMuted,
  fontFamily: "inherit",
  fontSize: vars.fontSize.secondary,
  fontWeight: 600,
  cursor: "pointer",
  selectors: {
    "&:hover": { color: vars.color.text },
    '&[aria-selected="true"]': { borderBottomColor: vars.color.accent, color: vars.color.text },
  },
});

export const panel = style({ minHeight: 0, overflowY: "auto", padding: `0.85rem ${vars.space.lg} ${vars.space.lg}` });
