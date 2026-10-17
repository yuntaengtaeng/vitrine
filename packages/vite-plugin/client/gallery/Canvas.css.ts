import { style } from "@vanilla-extract/css";
import { vars } from "./shared/theme/theme.css";
import { NARROW } from "./shared/ui/layout.css";

export const root = style({ display: "flex", flexDirection: "column", width: "100%", height: "100%" });

export const toolbar = style({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: `0.6rem ${vars.space.lg}`,
  minHeight: 44,
  padding: "0.35rem 1.25rem",
  borderBottom: `1px solid ${vars.color.border}`,
  "@container": { [NARROW]: { padding: `0.35rem ${vars.space.md}` } },
});

export const toolbarEnd = style({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: `${vars.space.sm} 0.9rem`,
  marginLeft: "auto",
});
