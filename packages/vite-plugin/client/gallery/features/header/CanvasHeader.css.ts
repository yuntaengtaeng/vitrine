import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";
import { NARROW } from "../../shared/ui/layout.css";

export const root = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.lg,
  minHeight: 56,
  padding: "0.8rem 1.25rem",
  borderBottom: `1px solid ${vars.color.border}`,
  "@container": { [NARROW]: { padding: `0.6rem ${vars.space.md}` } },
});

export const titles = style({ display: "grid", gap: 2, minWidth: 0 });

export const group = style({ color: vars.color.textMuted, fontSize: vars.fontSize.label });

export const name = style({
  margin: 0,
  overflow: "hidden",
  color: vars.color.text,
  fontSize: vars.fontSize.title,
  fontWeight: 650,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const meta = style({ display: "flex", alignItems: "center", gap: "0.6rem", marginLeft: "auto", minWidth: 0 });

export const file = style({
  overflow: "hidden",
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.label,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  "@container": { [NARROW]: { display: "none" } },
});
