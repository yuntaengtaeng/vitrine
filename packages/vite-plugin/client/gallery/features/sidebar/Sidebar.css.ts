import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";
import { field, fieldBorder } from "../../shared/ui/field.css";

export const root = style({
  width: 240,
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  background: vars.color.sidebar,
  borderRight: `1px solid ${vars.color.border}`,
});

export const header = style({
  display: "flex",
  alignItems: "baseline",
  padding: `${vars.space.lg} 1.45rem 0.6rem`,
  color: vars.color.textMuted,
  fontSize: vars.fontSize.label,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
});

export const count = style({ marginLeft: "auto", letterSpacing: 0, fontWeight: 500, fontVariantNumeric: "tabular-nums" });

export const search = style({ position: "relative", margin: `0 ${vars.space.md} ${vars.space.sm}` });

export const searchInput = style([field, { padding: "0 1.9rem 0 0.65rem" }]);

export const shortcut = style({
  position: "absolute",
  right: vars.space.sm,
  top: "50%",
  transform: "translateY(-50%)",
  padding: "0 5px",
  border: fieldBorder,
  borderRadius: vars.radius.sm,
  color: vars.color.textMuted,
  fontSize: "0.7rem",
  pointerEvents: "none",
});

export const tree = style({
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  // 스크롤은 유지하고 스크롤바만 숨김
  scrollbarWidth: "none",
  padding: `0 ${vars.space.md} ${vars.space.md}`,
});

export const message = style({
  margin: 0,
  padding: "0.4rem 0.7rem",
  color: vars.color.textMuted,
  fontSize: vars.fontSize.secondary,
});
