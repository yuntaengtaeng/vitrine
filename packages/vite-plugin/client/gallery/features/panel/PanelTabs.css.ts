import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";
import { iconButton } from "../../shared/ui/button.css";
import { MIN_PANEL_HEIGHT, MIN_STAGE_HEIGHT } from "./panelSize";

export const collapsedRoot = style({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  flexShrink: 0,
  borderTop: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
});

// 저장한 높이가 지금 화면에 비해 커도 창 크기를 바꿀 때마다 무대 높이를 남김
export const root = style([
  collapsedRoot,
  { minHeight: MIN_PANEL_HEIGHT, maxHeight: `max(${MIN_PANEL_HEIGHT}px, calc(100% - ${MIN_STAGE_HEIGHT}px))` },
]);

export const bar = style({
  display: "flex",
  alignItems: "center",
  minHeight: 40,
  padding: `0 ${vars.space.sm} 0 ${vars.space.lg}`,
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

export const collapseButton = style([iconButton, { width: 28, height: 28 }]);

export const expandIcon = style({ transform: "rotate(180deg)" });

export const panel = style({
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  padding: `0.85rem ${vars.space.lg} ${vars.space.lg}`,
  borderTop: `1px solid ${vars.color.border}`,
});
