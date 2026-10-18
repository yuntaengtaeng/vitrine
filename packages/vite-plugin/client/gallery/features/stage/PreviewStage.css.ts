import { style } from "@vanilla-extract/css";
import { vars } from "../../shared/theme/theme.css";
import { NARROW } from "../../shared/ui/layout.css";

export const root = style({
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  overflow: "auto",
  padding: `2.25rem ${vars.space.xxl} ${vars.space.xxl}`,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  backgroundColor: vars.color.surface,
  backgroundImage: `radial-gradient(${vars.color.stageDot} 1px, transparent 1px)`,
  backgroundSize: "14px 14px",
  "@container": { [NARROW]: { padding: `1.75rem ${vars.space.md} ${vars.space.md}` } },
});

// 고정 너비는 무대보다 넓어도 줄어들지 않고 무대를 가로 스크롤
export const frameSlot = style({
  position: "relative",
  flexShrink: 0,
  selectors: { "&[hidden]": { display: "none" } },
});

export const widthLabel = style({
  position: "absolute",
  right: 0,
  bottom: "100%",
  marginBottom: vars.space.xs,
  color: vars.color.textMuted,
  fontSize: vars.fontSize.label,
  fontVariantNumeric: "tabular-nums",
});

// border는 iframe 너비를 줄여 breakpoint 판정이 어긋나므로 너비에 포함되지 않는 outline 사용
export const frame = style({
  position: "relative",
  outlineWidth: 1,
  outlineStyle: "dashed",
  outlineOffset: 0,
  borderRadius: vars.radius.lg,
  overflow: "hidden",
});

// Gallery의 dark color-scheme을 물려받으면 프리뷰 문서와 달라져 브라우저가 iframe 뒤를 불투명한 흰색으로 칠함
export const iframe = style({
  display: "block",
  width: "100%",
  border: 0,
  background: "transparent",
  colorScheme: "normal",
});
