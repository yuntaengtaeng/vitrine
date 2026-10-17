import { style } from "@vanilla-extract/css";
import { vars } from "./shared/theme/theme.css";
import { iconButton } from "./shared/ui/button.css";
import { NARROW, galleryContainer } from "./shared/ui/layout.css";

export const root = style({
  containerName: galleryContainer,
  containerType: "inline-size",
  position: "relative",
  display: "flex",
  height: "100vh",
  background: vars.color.surface,
});

// 좁은 패널에서는 사이드바를 덮어 여는 서랍으로 바꿔 프리뷰 너비를 확보
export const sidebarSlot = style({
  display: "flex",
  minHeight: 0,
  "@container": {
    [NARROW]: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      zIndex: 2,
      maxWidth: "85%",
      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.18)",
      transform: "translateX(-100%)",
      visibility: "hidden",
      // 닫을 때만 밀려 나간 뒤 숨김, 열 때 바로 보여야 안으로 포커스를 옮길 수 있음
      transition: "transform 160ms ease, visibility 0s linear 160ms",
    },
  },
  selectors: { '&[data-open="true"]': { transform: "none", visibility: "visible", transition: "transform 160ms ease" } },
});

export const backdrop = style({
  display: "none",
  "@container": {
    [NARROW]: { display: "block", position: "absolute", inset: 0, zIndex: 1, background: "rgba(15, 23, 42, 0.2)" },
  },
  selectors: { "&[hidden]": { display: "none" } },
});

export const main = style({ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" });

export const narrowBar = style({
  display: "none",
  "@container": {
    [NARROW]: {
      display: "flex",
      alignItems: "center",
      padding: `${vars.space.xs} ${vars.space.sm}`,
      borderBottom: `1px solid ${vars.color.border}`,
      background: vars.color.sidebar,
    },
  },
});

export const menuButton = style([
  iconButton,
  { display: "flex", alignItems: "center", gap: 6, padding: `${vars.space.xs} ${vars.space.sm}`, fontSize: vars.fontSize.label },
]);

export const canvas = style({ flex: 1, minHeight: 0, overflow: "auto" });
